
import request from 'request'
import { Router } from 'express'
import { checkConfig } from '../utils'
import type { APSConfig } from '../types/aps'

/** APS Provided Routes
 * 
 * - /auth/signin
 * - /auth/signout
 * - /auth/verification
 * - /auth/change-phone
 * - /auth/resend-sms
 * - /auth/create-account
 * - /auth/qrsignin
 * 
 */
const ALLOWED_VERBS = [
  'signin',
  'signout',
  'verification', 
  'change-phone',
  'resend/sms', 
  'create-account',
  'qrsignin'
]
let CONFIG: APSConfig
    
function To( verb: string, method: string, body: any, headers: any = {} ){
  return new Promise( ( resolve, reject ) => {

    Object.assign( headers, {
                              // 'Origin': toOrigin( req.headers.host ),
                              'X-User-Agent': CONFIG.userAgent || 'GB.web/1.0',
                              'X-Auth-App': CONFIG.provider
                            } )
    
    request(`${CONFIG.baseURL}/${verb}`, { headers, method, form: body, json: true, timeout: 20000 },
            ( error, resp, body ) => {
              if( error ) return reject({ error: true, status: 'AUTH::FAILED', message: error })
              resolve( body )
            } )
  } )
}

export function config( options: APSConfig ){

  if( typeof options != 'object' )
    return ( req: any, res: any, next: any ) => next('[APS]: No Authentication Configuration Found')

  CONFIG = { ...(CONFIG || {}), ...options }

  // Check whether all configuration field are defined
  checkConfig( 'APS', CONFIG )
  
  return Router().all( '/auth/*', async ( req, res, next ) => {
    // Extrat after /auth/ as request verb pathname
    const 
    verb = req.url.replace('/auth/', ''),
    body = req.method == 'GET' ? req.query : req.body
    
    // Only allowed route verbs
    if( !ALLOWED_VERBS.includes( verb ) )
      return next('No Found')

    // Send request and forward answer
    try { res.json( await To( verb, req.method, body ) ) }
    catch( error ){ res.json({ error: true, status: 'AUTH::FAILED', message: 'Unexpected Error Occured' }) }
  } )
}

export const signout = async ( ctoken: string, deviceId: string ) => {
  // Send request to signout user
  try { return await To( 'signout', 'GET', false, { 'X-Auth-Token': ctoken, 'X-Auth-Device': deviceId } ) }
  catch( error ){ return { error: true, status: 'AUTH::FAILED', message: 'Unexpected Error Occured' } }
}