
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
const { URL } = require('url')
const request = require('request')

const
CONFIG = {},

isEmpty = entry => {
  // test empty array or object
  if( !entry || typeof entry !== 'object' ) return null

  return Array.isArray( entry ) ?
              !entry.length
              : Object[ Object.entries ? 'entries' : 'keys' ]( entry ).length === 0 && entry.constructor === Object
},
getOrigin = hreq => {

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
  cached,
  command,
  filterRE

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

  return bypassCache => {

    return new Promise( ( resolve, reject ) => {

      if( cached && !bypassCache ){
        resolve( cached )
        return
      }

      // system call
      exec( command, ( error, stdout, sterr ) => {

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

function Query( table ){

  const self = this

  async function exec( api, method, payload, callback ){
    // Execute query request to the data provider

    /** NOTE: Backend request usually do not specified
      origin, which is required in some cases by the
      Data provider in order to fulfill a request
    */
    let origin = ''
    try { origin = CONFIG.host || await getAddress() }
    catch( error ){}

    const headers = {
                      'origin': origin,
                      'cache-control': 'no-cache',
                      'mdp-user-agent': CONFIG.userAgent,
                      'mdp-access-token': CONFIG.accessToken,
                      'mdp-tenant-id': self.bribe || self.activeTenant || ''
                    }

    /* Leave no trace of a bribe even
      before the request is made
    */
    delete self.bribe
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

  this.insert = ( data, operators ) => {

    return new Promise( ( resolve, reject ) => {

      if( !data
          || typeof data != 'object'
          || isEmpty( data ) ) reject('Invalid Insertion Data Argument')

      let payload = { table, data }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      exec( '/query/insert',
            'POST', payload,
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }

  this.find = ( conditions, operators, alts ) => {

    return new Promise( ( resolve, reject ) => {

      if( !conditions || typeof conditions != 'object' )
        reject('Invalid Query Condition Argument')

      let payload = { table, conditions }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      exec( '/query/find'+( alts ? '?target='+ alts : '' ),
            'POST', payload,
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  this.findOne = async ( conditions, operators ) => { return await self.find( conditions, operators, 'one' ) }

  this.update = ( conditions, data, operators, alts ) => {

    return new Promise( ( resolve, reject ) => {

      if( !data
          || typeof data != 'object'
          || isEmpty( data ) ) reject('Invalid Query Data Argument')

      if( !conditions || typeof conditions != 'object' )
        reject('Invalid Query Condition Argument')

      let payload = { table, data, conditions }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      exec( '/query/update'+( alts ? '?target='+ alts : '' ),
            'PUT', payload,
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  this.updateOne = async ( conditions, data, operators ) => { return await self.update( conditions, data, operators, 'one' ) }
  this.updateMany = async ( conditions, data, operators ) => { return await self.update( conditions, data, operators, 'many' ) }

  this.delete = ( conditions, operators, alts ) => {
    /* NOTE: Upcoming operator
      - archive {boolean} MDP will push the item to
                archived collection instead of totally delete it
    */
    return new Promise( ( resolve, reject ) => {

      if( !conditions || typeof conditions != 'object' )
        reject('Invalid Query Condition Argument')

      let payload = { table, conditions }

      if( !isEmpty( operators ) )
        Object.assign( payload, operators )

      exec( '/query/delete'+( alts ? '?target='+ alts : '' ),
            'DELETE', payload,
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  this.deleteOne = async ( conditions, operators ) => { return await self.delete( conditions, operators, 'one' ) }
  this.deleteMany = async ( conditions, operators ) => { return await self.delete( conditions, operators, 'many' ) }

  // Find and only return the count of the result
  this.count = async ( conditions, operators ) => { return await self.find( conditions, Object.assign( operators || {}, { count: true } ) ) }

  // Massive aggregation pipeline
  this.aggregate = async stages => {

    return new Promise( ( resolve, reject ) => {

      if( !stages || typeof stages != 'object' )
        reject('Invalid Aggregation Stage Argument')

      exec( '/query/aggregate',
            'POST', { table, stages },
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
}

function Tenant(){

  async function exec( action, method, payload, callback ){
    // Execute query request to the data provider

    /** NOTE: Backend request usually do not specified
      origin, which is required in some cases by the
      Data provider in order to fulfill a request
    */
    let origin = ''
    try { origin = CONFIG.host || await getAddress() }
    catch( error ){}

    request( `${CONFIG.server}/tenant/${action}`,
            {
              method: method,
              headers: {
                'origin': origin,
                'cache-control': 'no-cache',
                'mdp-user-agent': CONFIG.userAgent,
                'mdp-access-token': CONFIG.accessToken
              },
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

  this.add = data => {

    return new Promise( ( resolve, reject ) => {

      exec( 'add',
            'POST', data,
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  this.update = ( tenantId, data ) => {

    return new Promise( ( resolve, reject ) => {

      exec( 'update',
            'PUT', { tenantId, updates: data },
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
  this.drop = tenantId => {

    return new Promise( ( resolve, reject ) => {

      exec( 'drop?tenantId='+ tenantId,
            'DELETE', {},
            ( error, result ) => error ? reject( error ) : resolve( result ) )
    } )
  }
}

function DSInterface( config ){

  Object.assign( CONFIG, config )
  
  this.collections = ( Array.isArray( config.collections ) && config.collections ) || Object.values( arguments )
  this.tenant = new Tenant()

  this.dp = () => {
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
      query.corrupt = tenantId => {

        query.bribe = tenantId
        return query
      }

      DSInterface.prototype[ each ] = query
    } )

    return this
  }
  this.middleware = async ( req, res, next ) => {
    // Assign each collection as Query Object to DSInterface
    const origin = getOrigin( req )
    // console.log('origin: ', origin )

    Array.isArray( this.collections )
    && this.collections.map( each => {

      const query = new Query( each )
      // Request Host is use as tenant ID
      query.activeTenant = origin.replace('auth.','')

      /** Give another tenant's ID to DP Query as bribe
        to overwite the request origin. Expecially designed
        to facilitate Share-Session

        WARNING: Using this the wrong way could create
        data accessibility bridge between tenant sessions.
      */
      query.corrupt = tenantId => {

        query.bribe = tenantId
        return query
      }

      DSInterface.prototype[ each ] = query
    } )

    req.dp = this
    next()
  }
}

module.exports = DSInterface