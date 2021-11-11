
const request = require('request')
const ioClient = require('socket.io-client')

let
IOClient,
TransportReady,
Listeners = {},

/* Establish socket connection with the 
  provided WPS server
*/
getConnect = endpoint => {

  // Socket client config
  const ioConfig = {
    transportOptions: {
      polling: {
        extraHeaders: {
          'WPS-User-Agent': Globe_WPSConfig.userAgent,
          'WPS-Event-Provider': Globe_WPSConfig.provider,
          'WPS-Access-Token': Globe_WPSConfig.accessToken
        }
      } 
    } 
  }

  IOClient = ioClient( endpoint, ioConfig )
                  .on( 'connect', () => console.log('[WPS-CONNECT]: Connectin Established') )
                  .on( 'connect_error', ({ message }) => {
                    // Cannot Push event on when an exception thrown
                    TransportReady = false
                    console.log('[WPS-CONNECT]: Connection Error: ', message )
                  } )
                  .on( 'TRANSPORT::READY', () => {
                    // Ready to push events
                    TransportReady = true
                    console.log('[WPS-CONNECT]: Events Transport Ready')
                  } )
                  .on( 'TRANSPORT::INCOMING', receiveEvent )
}

/* Send events request to webhook server
  only when the transport channel listeners
  handshaked.

  NOTE: Socket could be connect but for another
        namespace activities
*/
sendEvent = ( ...args ) => TransportReady ? IOClient.emit( 'TRANSPORT::OUTGOING', ...args ) : null,

/* Receive events request from webhook server
  and fire to registered listeners that
  matches them.
*/
receiveEvent = ( origin, _event, payload ) => {

  if( !Listeners.hasOwnProperty( _event ) )
    return

  // Fire all function listeners registered by this event
  Listeners[ _event ].map( fn => fn({ origin, body: payload }) )
},

/* Subscribe routes as listener to incoming
  requests
*/
registerEventListeners = list => {

  Object.entries( list )
        .map( ([ _event, fn ]) => {
          Listeners.hasOwnProperty( _event ) ?
                        Listeners[ _event ].push( fn ) // Add to existing listener slot
                        : Listeners[ _event ] = [ fn ] // New listener slot
        } )
}

module.exports = () => {

  if( !global.Globe_WPSConfig )
    throw new Error(`[WPS-CONNECT]: No Configuration Found`)
    
  request(`${Globe_WPSConfig.server}/v1/connect`, { headers: Globe_WPSConfig.headers, method: 'GET', json: true },
          ( error, resp, body ) => {
            if( error || body.error )
              throw new Error(`[WPS-CONNECT]: Failed Requesting connection > ${error || body.message }`)
            
            getConnect( body.endpoint )
          } )

  return {
    outgoing: ( req, res, next ) => {
      /** Make outgoing events trigger available
          from API router's request object
      */
      req.Event = ( _event, payload ) => sendEvent( getOrigin( req ), _event, payload )
      next()
    },
    incoming: listeners => registerEventListeners( listeners )
  }
}