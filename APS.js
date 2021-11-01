
import request from 'request'
import { Router } from 'express'

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

export default config => {

  if( !config )
    return ( req, res, next ) => next('Globe [APS]: No Authentication Configuration Found')
    
  function To( verb, method, body ){
    return new Promise( ( resolve, reject ) => {

      const headers = {
        // 'Origin': toOrigin( req.headers.host ),
        'X-User-Agent': config.userAgent,
        'X-Auth-App': config.appName
      }
      
      request(`${toOrigin( process.env.AUTH_REQUEST_SERVER )}/${verb}`,
                { headers, method, form: body, json: true },
                ( error, resp, body ) => {
                  if( error ) return reject({ error: true, status: 'AUTH::FAILED', message: error })
                  resolve( body )
                } )
    } )
  }  

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
    catch( error ){ res.json({ error: true, status: 'SIGNIN::FAILED', message: 'Unexpected Error Occured' }) }
  } )
}