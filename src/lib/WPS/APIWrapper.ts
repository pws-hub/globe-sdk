import request from 'request'

function To( verb: string, method: string, body?: any ){
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

export const createApp = async ( payload: any ) => {
  try { return await To( 'application/create', 'POST', payload ) }
  catch( error ){ return error }
}

export const getApp = async ( appId: string ) => {
  try { return await To( 'application/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

export const getApps = async () => {
  try { return await To( 'application/list', 'GET' ) }
  catch( error ){ return error }
}

export const updateApp = async ( appId: string, payload: any ) => {
  try { return await To( 'application/update/'+ appId, 'PUT', payload ) }
  catch( error ){ return error }
}

export const deleteApp = async ( appId: string ) => {
  try { return await To( 'application/delete/'+ appId, 'DELETE' ) }
  catch( error ){ return error }
}

export const testURL = async ( payload: string ) => {
  try { return await To( 'testurl', 'POST', payload ) }
  catch( error ){ return error }
}

export const getIncomingRequestURL = async ( appId: string ) => {
  try { return await To( 'generate/url/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

export const getIncomingRequestToken = async ( appId: string ) => {
  try { return await To( 'generate/incoming_token/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

export const getOutgoingRequestToken = async ( appId: string ) => {
  try { return await To( 'generate/outgoing_token/'+ appId, 'GET' ) }
  catch( error ){ return error }
}

export const send = async ( appId: string, payload: any ) => {

  if( typeof Globe_WPSConfig !== 'object' )
    return { error: true, status: 'WPS-REQUEST::FAILED', message: 'Undefined Configuration' }

  // Get Incoming request URL and save in Configs for next request
  if( !Globe_WPSConfig.sendVerb ){
    const response: any = await getIncomingRequestURL( appId )
    if( response.error ) return response

    Globe_WPSConfig.sendVerb = response.result.replace( Globe_WPSConfig.sendVerb +'/v1/', '')
  }
  
  // Sent incoming request
  try { return await To( Globe_WPSConfig.sendVerb as string, 'POST', payload ) }
  catch( error ){ return error }
}

export default {
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