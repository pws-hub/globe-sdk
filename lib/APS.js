
const request = require('request')
const Router = require('express').Router
const { checkConfig } = require('../utils')

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
let CONFIG = {}
    
function To( verb, method, body, headers = {} ){
  return new Promise( ( resolve, reject ) => {

    Object.assign( headers, {
                              // 'Origin': toOrigin( req.headers.host ),
                              'X-User-Agent': CONFIG.userAgent || 'GB.web/1.0',
                              'X-Auth-App': CONFIG.provider
                            } )
    
    request(`${CONFIG.baseURL}/${verb}`, { headers, method, form: body, json: true },
            ( error, resp, body ) => {
              if( error ) return reject({ error: true, status: 'AUTH::FAILED', message: error })
              resolve( body )
            } )
  } )
}

function config( options ){

  if( typeof options != 'object' )
    return ( req, res, next ) => next('[APS]: No Authentication Configuration Found')

  Object.assign( CONFIG, options )

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

module.exports = {
  config, 
  signout: async ( ctoken, deviceId ) => {
    // Send request to signout user
    try { return await To( 'signout', 'GET', false, { 'X-Auth-Token': ctoken, 'X-Auth-Device': deviceId } ) }
    catch( error ){ return { error: true, status: 'AUTH::FAILED', message: 'Unexpected Error Occured' } }
  }
}