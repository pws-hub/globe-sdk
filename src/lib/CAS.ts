/** CDN Assets Space
*
* @author: Fabrice Marlboro
*
* CDN Space configuration variables
* Note: AWS parameters are set in .env file
*
*   - DO_SPACE_KEY
*   - DO_SPACE_SECRET
*   - DO_SPACE_VERSION ( Version of AWS S3 API. Default is "latest" )
*   - DO_SPACE_ENDPOINT ( Storage Space endpoint. Eg. fra1.digitaloceanspaces.com )
*   - DO_SPACE_PUBLIC_ENDPOINT ( Public domain of the space. Eg. https://cdn.vend.one )
*   - DO_SPACE_ASSETS_URL_PREFIX ( static asset url prefix regex that route to CDN. Eg. @cdn)
*   - DO_SPACE_DEFAULT_BUCKET ( Defaut bucket name )
*
*   - TINIFY_API_KEY ( Tinify Compression API Key )[ https://tinypng.com/developers/reference ]
*
* @features:
*   # Multiple datacenter region spaces support
*   # Space:
*     - Create bucket
*     - Fetch existing assets list
*     - Get existing asset
*     - Write new assets: image, video, ...
*     - Compress assets before save to CDN space ( image with Tinify API: [ https://tinypng.com/developers/reference ] )
*     - Delete assets
*
*   # Static:
*     - Routers to route assets trafic between the CDN & a web application frontend
*/
import fs from 'fs'
import aws, { S3 } from 'aws-sdk'
import tinify from 'tinify'
import request from 'request'
import parseUrl from 'parseurl'
import randtoken from 'rand-token'
import { Readable, ReadableOptions, PassThrough } from 'stream'
import { checkConfig } from '../utils'
import type { 
  CASConfig,
  S3Connection,
  SpaceOption,
  StreamParams,
  S3ProgressListener
} from '../types/cas'

let
CONFIG: CASConfig,
CONN: { [index: string]: S3Connection } = {}

class S3Downstream extends Readable {
  
  S3: S3 // AWS.S3 instance
  __currentCursorPosition = 0 // Holds the current starting position for our range queries
  __chunkRange = 128 // Amount of bytes to grab (2048 is default: For HD video files)
  __maxContentLength: number // Total number of bites in the file
  __S3Params: S3.GetObjectRequest // Parameters passed into s3.getObject method
  __streamParams: StreamParams

  /** Pass any ReadableStream options to the NodeJS Readable 
   * super class here. For this example we wont use this, 
   * however I left it in to be more robust
   */
  constructor( S3Instance: S3, S3Params: S3.GetObjectRequest, streamParams: StreamParams, readableStreamOptions?: ReadableOptions ) {
    super( readableStreamOptions )

    this.S3 = S3Instance
    
    this.__S3Params = S3Params
    this.__streamParams = streamParams

    if( streamParams.chunkRange )
      this.__chunkRange = streamParams.chunkRange

    // maxLength is strictly required
    if( !streamParams.maxLength ) throw new Error('Undefined Maximum Data Content Length')
    this.__maxContentLength = streamParams.maxLength
  }

  _read(){
    /** If the current position is greater than 
     * the amount of bytes in the file. 
     * We push null into the buffer, NodeJS
     * ReadableStream will see this as the end 
     * of file (EOF) and emit the 'end' event
     */
    if( this.__currentCursorPosition > this.__maxContentLength )
      this.push( null )
    
    else {
      const
      // Calculate the range of bytes we want to grab
      range = this.__currentCursorPosition + ( this.__chunkRange * 1024 ),
      /** If the range is greater than the total number of 
       * bytes in the file. We adjust the range to grab 
       * the remaining bytes of data 
       */
      adjustedRange = range < this.__maxContentLength ? range : this.__maxContentLength

      // Set the Range property on our s3 stream parameters
      this.__S3Params.Range = `bytes=${this.__currentCursorPosition}-${adjustedRange}`
      // Update the current range beginning for the next go
      this.__currentCursorPosition = adjustedRange + 1
      // Grab the range of bytes from the file
      this.S3.getObject( this.__S3Params, ( error, data ) => {
        error ?
          /** If we encounter an error grabbing the bytes. 
           * We destroy the stream, NodeJS ReadableStream 
           * will emit the 'error' event
           */
          this.destroy( error )
          // We push the data into the stream buffer
          : this.push( data.Body )
      })
    }
  }
}

class S3Upstream {

  queueSize = 1 // How many chunk/part of bytes to simultaneously stream
  chunkRange = 128 // Amount of bytes to send (2048 is default: For HD video files)
  promise: Promise<S3.ManagedUpload.SendData>
  upStream: PassThrough
  private progressListener: S3ProgressListener

  constructor( S3Instance: S3, S3Params: S3.PutObjectRequest, streamParams: StreamParams ){
    
    const pass = new PassThrough()

    S3Params.Body = pass
    this.progressListener = ({ loaded, total }) => { console.log(`Progress: ${loaded}/${total || '-'}`) }
    
    if( streamParams.queueSize ) this.queueSize = streamParams.queueSize
    if( streamParams.chunkRange ) this.chunkRange = streamParams.chunkRange

    const manager = S3Instance.upload( S3Params, {
                                                  partSize: this.chunkRange * 1024, 
                                                  queueSize: this.queueSize 
                                                })
    manager.on('httpUploadProgress', details => this.progressListener( details ) )

    this.upStream = pass
    this.promise = manager.promise()
  }

  trackProgress( fn: S3ProgressListener ){ this.progressListener = fn }
}

function Init(){
  
  // Empty config
  if( !Object.keys( CONFIG ).length )
    throw new Error('[CAS]: Undefined Configuration. User <config> method')

  // Initialize AWS Interface
  aws.config.update({
    accessKeyId: CONFIG.accessKey,
    secretAccessKey: CONFIG.secret
  })
  
  // Compression Provider Key
  tinify.key = CONFIG.compressKey

  // Check whether spaces are defined
  if( !Array.isArray( CONFIG.spaces ) || !CONFIG.spaces.length )
    throw new Error('[CAS]: Invalid configuration. <spaces> field is expected to be <array>')

  // Create S3 clients by region
  CONFIG.spaces.map( space => {
    // Check whether all configuration field are defined
    checkConfig( 'CAS:SPACE', space )
    
    CONN[ space.region ] = {
      bucket: space.bucket,
      host: space.host,
      S3: new aws.S3({ endpoint: new aws.Endpoint( space.endpoint ), apiVersion: space.version || 'latest' })
    }
  })
  
  // Methods to interact with spaces by datacenter region
  function Space( region?: string, options?: SpaceOption ){
    
    region = region
              /** Control switching between regions by request thread 
               * by setting `req.session.cas_region` value to targeted
               * region. 
               * 
               * NOTE: Support for `req.session` must be defined by the express app.
               *        otherwise will fallback to default region.
               */
              // || (this.session && this.session.cas_region)
              // Fallback/Default region
              || CONFIG.defaultRegion // Predefined in the configuration
              || CONFIG.spaces[0].region // First specified space's region

    function getURL( path: string ){
      return `${( typeof options == 'object' && options.absoluteURL ? CONN[ region as string ].host : '@'+ region )}/${path}`
    }

    function write( path: string, body: any, bucket?: string ){
      return new Promise( ( resolve, reject ) => {

        if( !path ) return reject('Undefined File Path')
        if( !body ) return reject('Undefined File Body')

        path = path.replace(/^\//,'')

        const options = {
          Bucket: bucket || CONN[ region as string ].bucket,
          Key: path,
          // private | public-read | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control
          ACL: 'public-read-write',
          // ACL: CONFIG.permission || 'public-read-write',
          Body: body
        }

        CONN[ region as string ].S3.putObject( options, ( error, data ) => error ? reject( error ) : resolve( getURL( path ) ) )
      } )
    }

    function compress( path: string, options?: any ){
      return new Promise( ( resolve, reject ) => {

        const filepath = ( options.namespace ? options.namespace +'/' : '' )
                          +( options.type ? options.type +'/' : '' )
                          +( options.name ? options.name : randtoken.generate(58) )+'-'+ Date.now()
                          +( options.extension || '.'+( options.mime ? options.mime.split('/')[1] : 'jpg' ) )

        // Only image file compression is supported for now
        if( options.mime.includes('image') ){
          tinify.fromFile( path )
                .preserve( 'copyright', 'creation' )
                .toBuffer( ( error, resultData ) => {
                  if( error ) return reject( error )

                  write( filepath, resultData )
                    .then( link => resolve( link ) )
                    .catch( error => reject( error ) )
                } )
        
          return
        }
        
        // Write raw file to CDN Storage
        fs.readFile( path, ( error, resultData ) => {

            if( error ) return reject( error )

            write( filepath, resultData )
                .then( link => resolve( link ) )
                .catch( error => reject( error ) )
        })
      } )
    }

    function fetch( folder: string, bucket?: string ){
      return new Promise( ( resolve, reject ) => {
        const options = {
          Bucket: bucket || CONN[ region as string ].bucket,
          // Delimiter: 'STRING_VALUE',
          // EncodingType: url,
          // ExpectedBucketOwner: 'STRING_VALUE',
          // Marker: 'STRING_VALUE',
          // MaxKeys: limit,
          Prefix: folder || ''
        }

        CONN[ region as string ].S3.listObjects( options, ( error, data ) => {
          error ?
            reject( error )
            : resolve( (data.Contents || []).map( each => {
                return {
                  src: getURL( each.Key as string ),
                  size: each.Size,
                  lastModified: each.LastModified
                }
            } ) )
        } )
      } )
    }

    return {
      // Create asset bucket
      bucket: ( name: string ) => {
        return new Promise( ( resolve, reject ) => {
          const options = {
            Bucket: name,
            // ACL: 'public-read-write',
            // CreateBucketConfiguration: {
            //     LocationConstraint: 'EU'
            // },
            // GrantFullControl: 'write',
            // GrantRead: 'STRING_VALUE',
            // GrantReadACP: 'STRING_VALUE',
            // GrantWrite: 'STRING_VALUE',
            // GrantWriteACP: 'STRING_VALUE',
            // ObjectLockEnabledForBucket: true || false
          }

          CONN[ region as string ].S3.createBucket( options, ( error, data ) => error ? reject( error ) : resolve( data ) )
        } )
      },

      // Get item from CDN
      get: ( path: string, type?: string ) => {
        return new Promise( ( resolve, reject ) => {
          
          const options: any = { url: CONN[ region as string ].host + path }
          if( type )
            type == 'json' ?
                  options.json = true
                  : options.encoding = type
                  
          request.get( options, ( error: any, response: any, body: any ) => {
            // console.log('request response: ', response )
            if( error ){
              console.log('CDN HTTPS/GET Request Error: ', error )
              return reject( error )
            }

            resolve( body )
          } )
        } )
      },

      // Fetch assets
      fetch,

      // Write a new asset
      write,

      // Compress asset before to write
      compress,

      // Delete asset
      delete: ( path: string, bucket?: string ) => {
        return new Promise( ( resolve, reject ) => {

          if( !path ) return reject('Undefined File Path')
          path = path.replace(/^\//,'')

          const options = { 
            Bucket: bucket || CONN[ region as string ].bucket, 
            Key: path 
          }

          CONN[ region as string ].S3.deleteObject( options, ( error, data ) => error ? reject( error ) : resolve( true ) )
        } )
      },

      // Stream asset
      stream: {
        /** Handle stream download file from Amazon S3 */
        from: ( path: string, pipeStreamOptions?: ReadableOptions ): Promise<S3Downstream> => {
          return new Promise( ( resolve, reject ) => {
            
            const options = {
              Bucket: CONN[ region as string ].bucket, 
              Key: path
            }
            try {
              CONN[ region as string ].S3.headObject( options, ( error, data ) => {
                if( error ) return reject( error )
                
                /** Instantiate the S3Downstream class with 
                 * details returned by s3.headObject
                 * 
                 * NOTE: Set default chunk data range to 1Mb (1024)
                 *        by default.
                 *        Though, scheduled to be upgraded to 
                 *        self adaptation to underline bandwith
                 */
                const streamParams = {
                  chunkRange: 1024,
                  maxLength: data.ContentLength as number
                }
                resolve( new S3Downstream( CONN[ region as string ].S3, options, streamParams, pipeStreamOptions ) )
              })
            }
            catch( error ){ reject( error ) }
          })
        },

        /** Handle stream upload file to Amazon S3 */
        to: async ( path: string, progress?: S3ProgressListener ): Promise<S3Upstream['upStream']> => {
          const
          options = {
            Bucket: CONN[ region as string ].bucket, 
            Key: path
          },
          /** Instantiate the S3Upstream class to upload
           * 
           * NOTE: Set default chunk data range to 5Mb (5 * 1024)
           *        by default: Minimum limit set by AWS S3
           *        Though, scheduled to be upgraded to 
           *        self adaptation to underline bandwith.
           * 
           *        Also queue at least 4 chunks/parts of 5M
           *        simultaneously to speed up the streaming
           *        if the underline connection can handle it.
           */
          manager = new S3Upstream( CONN[ region as string ].S3, options, { chunkRange: 5 * 1024, queueSize: 4 } )
          
          // Register progress tracking listener
          typeof progress == 'function'
          && manager.trackProgress( progress )
          
          // Log stream error in console
          manager.promise.catch( console.log )
          // Return upload stream to be piped
          return manager.upStream
        }
      }
    }
  }
  
  // Middleware to serve CDN Assets as proxy to a web application frontend
  function Static( req: any, res: any, next: any ){
    /** IMPORTANT: Bind space function to express request
     *  thread object, to be able to access & call 
     * `req.app.Space(...)` method in middlewares & routers 
     */
    req.app.Space = Space.bind(req)
    
    let 
    path = decodeURIComponent( parseUrl( req )?.pathname as string ).replace(/^\//,''),
    regions = Object.keys( CONN )

    /** Temporay fix to still route @cdn prefix assets created
     *  on getlearncloud.com platform.
     * 
     * TODO: Clear this lines and next below later
     */
    regions.push('cdn')

    const prefixRegex = new RegExp(`^@(${regions.join('|')})/` )

    if( ( req.method !== 'GET'
          && req.method !== 'HEAD' )
        /* CDN Assets URL cognition prefix: Require in
          a case whereby this middleware is used globaly

          Otherwire, every asssets url related or not to
          the CDN will be send as request to the CDN server
          Notice: It impact on performance an some XML errors
                  maybe return as response content if the
                  requested find is not found.
        */
        || !prefixRegex.test( path )
        || !/\.[a-z0-9]{3,8}$/.test( path ) ) // Known application files extensions
      return next()

    let [ _, region ] = path.match( prefixRegex ) || []
    path = path.replace( prefixRegex, '')


    /** Temporay fix to still route @cdn prefix assets created
     *  on getlearncloud.com platform.
     * 
     * TODO: Clear this lines and previous above later
     * 
     * Control switching between regions by request thread 
     * by setting `req.session.cas_region` value to targeted
     * region. 
     * 
     * NOTE: Support for `req.session` must be defined by the express app.
     *        otherwise will fallback to default region.
     */
    if( region == 'cdn' )
      region = (req.session && req.session.cas_region) 
                // Fallback/Default region
                || CONFIG.defaultRegion // Predefined in the configuration
                || CONFIG.spaces[0].region // First specified space's region

    function onError( error: any ){
      console.log('HTTPS Request Error: ', error )
      next(`[CAS]: ${error}`)
    }

    if( !CONN[ region ] || !CONN[ region ].host )
      return onError('[CAS]: Invalid space region')
    
    // console.log( 'out:', `${CONN[ region ].host}/${path}` )
    req.pipe( request(`${CONN[ region ].host}/${path}`).on( 'error', onError ) )
        .pipe( res )
  }
  
  // Manually use APIs
  return { Space, Static }
}

export const config = ( options: CASConfig ) => {

  if( typeof options != 'object' )
    return ( req: any, res: any, next: any ) => next('[CAS]: Undefined Configuration')
  
  // Check whether all configuration field are defined
  CONFIG = { ...(CONFIG || {}), ...options }
  checkConfig( 'CAS', CONFIG )

  // Initialize
  return Init()
}