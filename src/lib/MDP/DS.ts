
/** Data-Provider Interface/Driver

  Give a simple interface that reduce the hassle of making
  traditional API request and its params to the Data-Provider
  server.
  
  @author Fabrice Marlboro

  @params collections (Array) List of collections, subject of query
                      transactions or use function "arguments" as alternative
  @params options:
      - agent: User-Agent or this consumer (Know by the DP)
      - token: Authentication token given to the consumer by the Data-Provider

  WARNING: Requires environment variable (in .env file) like:
    - MDP_ENDPOINT = Host of the Main Data Provider server
    - MDP_ACCESS_TOKEN = Access token to that server
    - USER_AGENT & USER_AGENT_VERSION = to be identify as the request origin
    - ADDRESS = Define the origin of query requests (Optional: default is IP address of the server)
*/
import { URL } from 'url'
import request from 'request'
import FPlugin from 'fastify-plugin'
import { FastifyInstance, FastifyRequest, FastifyPluginAsync } from 'fastify'
import type { MDPConfig } from '../../types/mdp'

let CONFIG: MDPConfig

const
isEmpty = ( entry: any ) => {
  // test empty array or object
  if( !entry || typeof entry !== 'object' ) return null

  return Array.isArray( entry ) ?
              !entry.length
              : Object.keys( entry ).length === 0 && entry.constructor === Object
},
getOrigin = ( hreq: any ) => {

  const origin = hreq.headers.origin ?
                          new URL( hreq.headers.origin ).hostname
                          : hreq.headers.host

  return ( origin || '' ).replace(/:[0-9]{4,}/,'')
},
getAddress = ( () => {

  const
  ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i,
  exec = require('child_process').exec

  let
  cached: any,
  command: any,
  filterRE: any

  switch( process.platform ){
    case 'win32': command = 'ipconfig'
                  filterRE = /\bIPv[46][^:\r\n]+:\s*([^\s]+)/g
        break

    case 'darwin': command = 'ifconfig'
                    filterRE = /\binet\s+([^\s]+)/g
                    // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
        break

    default: command = 'ifconfig'
              filterRE = /\binet\b[^:]+:\s*([^\s]+)/g
              // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
        break
  }

  return ( bypassCache?: boolean ) => {

    return new Promise( ( resolve, reject ) => {

      if( cached && !bypassCache ){
        resolve( cached )
        return
      }

      // system call
      exec( command, ( error: any, stdout: any, sterr: any ) => {

        if( error )
          return reject( error )

        cached = []

        let
        matches = stdout.match( filterRE ) || [],
        ip

        for( var i = 0; i < matches.length; i++ ){
          ip = matches[i].replace( filterRE, '$1' )
          if( !ignoreRE.test( ip ) )
            cached.push( ip )
        }

        resolve( cached )
      })
    } )
  }
})()

class Query {

  private table: string
  activeTenant: string = ''
  corrupt: any
  bribe: string = ''

  constructor( table: string ){
    this.table = table
  }

  private async exec( api: string, method: string, payload: any, callback: ( error: any, result?: any ) => void ){
    // Execute query request to the data provider

    /** NOTE: Backend request usually do not specified
      origin, which is required in some cases by the
      Data provider in order to fulfill a request
    */
    let origin = ''
    try { origin = CONFIG.host || await getAddress() as string }
    catch( error ){}

    const headers = {
                      'origin': origin,
                      'cache-control': 'no-cache',
                      'mdp-user-agent': CONFIG.userAgent,
                      'mdp-access-token': CONFIG.accessToken,
                      'mdp-tenant-id': this.bribe || this.activeTenant || ''
                    }

    /* Leave no trace of a bribe even
      before the request is made
    */
    this.bribe = ''
    // console.log( 'headers: ', headers )

    request( CONFIG.server + api,
            {
              method: method,
              headers,
              body: payload,
              json: true
            },
            ( error, response, body ) => {
              // Normal request error
              if( error ) return callback( error )
                // String response returned: Usually 400, 401, 403 errors
              if( typeof body == 'string' ) return callback( body )
              // Requested process error
              if( body.error ) return callback( body.message )

              callback( false, body.result !== undefined ? body.result : body.message )
            } )
  }

  insert( data: any, operators?: any ){
    return new Promise( ( resolve, reject ) => {

      if( !data
          || typeof data != 'object'
          || isEmpty( data ) ) reject('Invalid Insertion Data Argument')

      let payload = { table: this.table, data }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      this.exec( '/query/insert',
                  'POST', payload,
                  ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }

  find( conditions: any, operators?: any, alts?: any ){

    return new Promise( ( resolve, reject ) => {

      if( !conditions || typeof conditions != 'object' )
        reject('Invalid Query Condition Argument')

      let payload = { table: this.table, conditions }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      this.exec( '/query/find'+( alts ? '?target='+ alts : '' ),
                  'POST', payload,
                  ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  async findOne( conditions: any, operators?: any ){ return await this.find( conditions, operators, 'one' ) }

  update( conditions: any, data: any, operators?: any, alts?: any ){

    return new Promise( ( resolve, reject ) => {

      if( !data
          || typeof data != 'object'
          || isEmpty( data ) ) reject('Invalid Query Data Argument')

      if( !conditions || typeof conditions != 'object' )
        reject('Invalid Query Condition Argument')

      let payload = { table: this.table, data, conditions }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      this.exec( '/query/update'+( alts ? '?target='+ alts : '' ),
                  'PUT', payload,
                  ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  async updateOne( conditions: any, data: any, operators?: any ){ return await this.update( conditions, data, operators, 'one' ) }
  async updateMany( conditions: any, data: any, operators?: any ){ return await this.update( conditions, data, operators, 'many' ) }

  delete( conditions: any, operators: any, alts?: any ){
    /* NOTE: Upcoming operator
      - archive {boolean} MDP will push the item to
                archived collection instead of totally delete it
    */
    return new Promise( ( resolve, reject ) => {

      if( !conditions || typeof conditions != 'object' )
        reject('Invalid Query Condition Argument')

      let payload = { table: this.table, conditions }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      this.exec( '/query/delete'+( alts ? '?target='+ alts : '' ),
                  'DELETE', payload,
                  ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  async deleteOne( conditions: any, operators?: any ){ return await this.delete( conditions, operators, 'one' ) }
  async deleteMany( conditions: any, operators?: any ){ return await this.delete( conditions, operators, 'many' ) }

  // Find and only return the count of the result
  async count( conditions: any, operators?: any ){ return await this.find( conditions, Object.assign( operators || {}, { count: true } ) ) }

  // Massive aggregation pipeline
  async aggregate( stages: any ){
    return new Promise( ( resolve, reject ) => {

      if( !stages || typeof stages != 'object' )
        reject('Invalid Aggregation Stage Argument')

      this.exec( '/query/aggregate',
                  'POST', { table: this.table, stages },
                  ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }

  // Drop collection
  async drop(){
    return new Promise( ( resolve, reject ) => {
      this.exec( '/query/drop',
                  'POST', { table: this.table },
                  ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
}

class Tenant {

  private async exec( action: string, method: string, payload: any, callback: ( error: any, result?: any ) => void ){
    // Execute query request to the data provider

    /** NOTE: Backend request usually do not specified
      origin, which is required in some cases by the
      Data provider in order to fulfill a request
    */
    let origin = ''
    try { origin = CONFIG.host || await getAddress() as string }
    catch( error ){}

    const options: any = {
      method: method,
      headers: {
        'origin': origin,
        'cache-control': 'no-cache',
        'mdp-user-agent': CONFIG.userAgent,
        'mdp-access-token': CONFIG.accessToken
      },
      json: true, 
      timeout: 8000
    }

    if( payload ) options.body = payload

    request(`${CONFIG.server}/tenant/${action}`, options, ( error, response, body ) => {
      // Normal request error
      if( error ) return callback( error )
        // String response returned: Usually 400, 401, 403 errors
      if( typeof body == 'string' ) return callback( body )
      // Requested process error
      if( body.error ) return callback( body.message )

      callback( false, body.result !== undefined ? body.result : body.message )
    } )
  }

  add( data: any ){
    return new Promise( ( resolve, reject ) => {
      this.exec('add',
                'POST', data,
                ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  list(){
    return new Promise( ( resolve, reject ) => {
      this.exec('list', 
                'GET', null,
                ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  update( tenantId: string, data: any ){
    return new Promise( ( resolve, reject ) => {
      this.exec('update',
                'PUT', { tenantId, updates: data },
                ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  drop( tenantId: string ){
    return new Promise( ( resolve, reject ) => {
      this.exec('drop?tenantId='+ tenantId,
                'DELETE', {},
                ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
}

function setPrototype<T extends Function, K extends keyof T['prototype']>( classHandler: T, method: K, queryObject: Query ){
  classHandler.prototype[ method ] = queryObject
}

class DSInterface {
  private collections: string[]
  private tenant: Tenant
  [index: string]: any

  constructor( config: MDPConfig ){
    CONFIG = { ...(CONFIG || {}), ...config }
    
    this.collections = ( Array.isArray( config.collections ) && config.collections ) || Object.values( arguments )
    this.tenant = new Tenant()
  }

  dp( this: this ){
    // Assign each collection as Query Object to DSInterface
    Array.isArray( this.collections )
    && this.collections.map( each => {

      const query = new Query( each )

      /** Give another tenant's ID to DP Query as bribe
        to overwite the request origin. Expecially designed
        to facilitate Share-Session

        WARNING: Using this the wrong way could create
        data accessibility bridge between tenant sessions.
      */
      query.corrupt = ( tenantId: string ) => {
        query.bribe = tenantId
        return query
      }

      DSInterface.prototype[ each ] = query
    } )

    return this
  }

  private async middleware( req: FastifyRequest | any ){
    // Assign each collection as Query Object to DSInterface
    const origin = getOrigin( req )

    Array.isArray( this.collections )
    && this.collections.map( each => {

      const query = new Query( each )
      // Request Host is use as tenant ID
      query.activeTenant = origin.replace('auth.', '')

      /** Give another tenant's ID to DP Query as bribe
        to overwite the request origin. Expecially designed
        to facilitate Share-Session

        WARNING: Using this the wrong way could create
        data accessibility bridge between tenant sessions.
      */
      query.corrupt = ( tenantId: string ) => {
        query.bribe = tenantId
        return query
      }

      // DSInterface.prototype[ each ] = query
      setPrototype( DSInterface, each, query )
    } )

    req.dp = this
  }
  
  express(){
    return ( req: any, res: any, next: any ) => {
      this.middleware.bind(this)( req )
      next()
    }
  }

  fastify(){
    return FPlugin( async ( App: FastifyInstance ) => {
      App.addHook( 'onRequest', this.middleware.bind(this) )
    } ) as FastifyPluginAsync
  }
}

export default DSInterface