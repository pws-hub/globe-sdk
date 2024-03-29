
import request from 'request'
import ioClient from 'socket.io-client'
import { getOrigin } from '../../utils'
import type { EventListeners, CustomListeners } from '../../types/wps'

let
IOClient: any,
TransportReady: any,
Listeners: EventListeners = {},
Manager = {
  emit: ( _event: string, target: string, payload: any ) => {

    if( !global.Globe_WPSConfig.host )
      throw new Error('Undefined Event Origin. Check configuration <host>')

    if( typeof _event !== 'string' || !target || !payload )
      throw new Error('Invalid Event Parameters')

    sendEvent( global.Globe_WPSConfig.host, _event, target, payload )
  },
  outgoing: ( req: any, res: any, next: any ) => {
    /** Make outgoing events trigger available
        from API router's request object
    */
    req.Event = ( _event: string, target: string, payload: any ) => sendEvent( getOrigin( req ), _event, target, payload )
    next()
  },
  incoming: ( listeners: {[index: string]: any } ) => registerEventListeners( listeners )
}

/* Establish socket connection with the 
  provided WPS server
*/
function getConnect( endpoint: string ){
  return new Promise( ( resolve, reject ) => {
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

    IOClient = 
    ioClient( endpoint, ioConfig )
    .on( 'connect', () => console.log('[WPS-CONNECT]: Connectin Established') )
    .on( 'connect_error', ({ message }) => {
      // Cannot Push event on when an exception thrown
      TransportReady = false
      console.log('[WPS-CONNECT]: Connection Error: ', message )
      reject( message )
    } )
    .on( 'TRANSPORT::READY', () => {
      // Ready to push events
      TransportReady = true
      console.log('[WPS-CONNECT]: Events Transport Ready')
      resolve( Manager )
    } )
    .on( 'TRANSPORT::INCOMING', receiveEvent )
  } )
}

/* Send events request to webhook server
  only when the transport channel listeners
  handshaked.

  NOTE: Socket could be connect but for another
        namespace activities
*/
function sendEvent( ...args: any ){ TransportReady && IOClient.emit( 'TRANSPORT::OUTGOING', ...args ) }

/* Receive events request from webhook server
  and fire to registered listeners that
  matches them.
*/
function receiveEvent( origin: string, payload: any ){
  // Fire all function listeners registered by this event
  const _event = payload.type || payload.event

  Listeners.hasOwnProperty( _event )
  && Listeners[ _event ].map( fn => fn({ origin, body: payload }) )
}

/* Subscribe routes as listener to incoming requests */
function registerEventListeners( list: CustomListeners ){

  Object.entries( list )
        .map( ([ _event, fn ]) => {
          Listeners.hasOwnProperty( _event ) ?
                        Listeners[ _event ].push( fn ) // Add to existing listener slot
                        : Listeners[ _event ] = [ fn ] // New listener slot
        } )
}

export default () => {
  return new Promise( ( resolve, reject ) => {

    if( !global.Globe_WPSConfig )
      return reject(`[WPS-CONNECT]: No Configuration Found`)
      
    request(`${Globe_WPSConfig.server}/v1/connect`, { headers: Globe_WPSConfig.headers, method: 'GET', json: true, timeout: 8000 },
            ( error, resp, body ) => {
              if( error || body.error )
                return reject(`[WPS-CONNECT]: Failed Requesting connection > ${error || body.message }`)
              
              resolve( getConnect( body.endpoint ) )
            } )
  } )
}