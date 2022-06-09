
const request = require('request')

function To( verb, method, body ){
  return new Promise( ( resolve, reject ) => {

    if( typeof Globe_WPSConfig !== 'object' )
      return reject({ error: true, status: 'WPS-REQUEST::FAILED', message: 'Undefined Configuration' })

    const { server, headers } = Globe_WPSConfig
    
    request(`${server}/v1/${verb}`, { headers, method, form: body, json: true, timeout: 8000 },
            ( error, resp, body ) => {
              if( error ) return reject({ error: true, status: 'WPS-REQUEST::FAILED', message: error })
              resolve( body )
            } )
  } )
}

async function createApp( payload ){
  try { return await To( 'application/create', 'POST', payload ) }
  catch( error ){ return error }
}

async function getApp( appId ){
  try { return await To( 'application/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

async function getApps(){
  try { return await To( 'application/list', 'GET' ) }
  catch( error ){ return error }
}

async function updateApp( appId, payload ){
  try { return await To( 'application/update/'+ appId, 'PUT', payload ) }
  catch( error ){ return error }
}

async function deleteApp( appId ){
  try { return await To( 'application/delete/'+ appId, 'DELETE' ) }
  catch( error ){ return error }
}

async function testURL( payload ){
  try { return await To( 'testurl', 'POST', payload ) }
  catch( error ){ return error }
}

async function getIncomingRequestURL( appId ){
  try { return await To( 'generate/url/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

async function getIncomingRequestToken( appId ){
  try { return await To( 'generate/incoming_token/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

async function getOutgoingRequestToken( appId ){
  try { return await To( 'generate/outgoing_token/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

async function send( appId, payload ){

  if( typeof Globe_WPSConfig !== 'object' )
    return reject({ error: true, status: 'WPS-REQUEST::FAILED', message: 'Undefined Configuration' })

  // Get Incoming request URL and save in Configs for next request
  if( !Globe_WPSConfig.sendVerb ){
    const response = await getIncomingRequestURL( appId )
    if( response.error )
      return reject( response )

    Globe_WPSConfig.sendVerb = response.result.replace( Globe_WPSConfig.sendVerb +'/v1/', '')
  }
  
  // Sent incoming request
  try { return await To( Globe_WPSConfig.sendVerb, 'POST', payload ) }
  catch( error ){ return error }
}

module.exports = {
  createApp, 
  getApp, 
  getApps, 
  updateApp, 
  deleteApp, 
  testURL,
  getIncomingRequestURL,
  getIncomingRequestToken,
  getOutgoingRequestToken,
  send
}