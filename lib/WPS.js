
const ioClient = require('socket.io-client')
const { checkConfig } = require('../utils')

let
IOClient,
TransportReady,
Listeners = {}

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

function connect( config ){

  // Check whether all configuration field are defined
  checkConfig( 'WPS', config )
  
  // Socket client configs
  const ioConfig = {
    transportOptions: {
      polling: {
        extraHeaders: {
          'WPS-User-Agent': config.userAgent,
          'WPS-Event-Provider': config.provider,
          'WPS-Access-Token': config.token
        }
      } 
    } 
  }

  IOClient = ioClient( config.server, ioConfig )
                  .on( 'connect', () => console.log('[WPS-CONNECT] Connectin Established') )
                  .on( 'connect_error', ({ message }) => {
                    // Cannot Push event on when an exception thrown
                    TransportReady = false
                    console.log('[WPS-CONNECT] Connection Error: ', clc.yellow( message ) )
                  } )
                  .on( 'TRANSPORT::READY', () => {
                    // Ready to push events
                    TransportReady = true
                    console.log('[WPS-CONNECT] Ready to Transport Events')
                  } )
                  .on( 'TRANSPORT::INCOMING', receiveEvent )

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

module.exports = { connect }