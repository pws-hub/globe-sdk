import { URL } from 'url'
let DEBUG_MODE = true

export const checkConfig = ( type: string, config: any ) => {

  if( !config )
    throw new Error(`[${type}] No configuration defined`)

  if( typeof config !== 'object' )
    throw new Error(`[${type}] Invalid configuration`)

  let requiredFields: string[] = []
  switch( type ){
    case 'Authorizer': requiredFields = [ 'service', 'manifest', 'agentHeader', 'tokenHeader' ]; break // 'framework', 'expiry', 'rotateToken', 'allowedOrigins'
    case 'APS': requiredFields = [ 'baseURL', 'provider' ]; break
    case 'CSA': requiredFields = [ 'baseURL', 'accessToken' ]; break
    case 'WPS': requiredFields = [ 'server', 'userAgent', 'provider', 'host', 'accessToken' ]; break
    case 'BND': requiredFields = [ 'server', 'userAgent', 'application', 'host', 'accessToken' ]; break
    case 'CAS': requiredFields = [ 'accessKey', 'secret', 'spaces' ]; break
    case 'CAS:SPACE': requiredFields = [ 'region', 'endpoint', 'host', 'bucket' ]; break
    case 'MDP.DS': requiredFields = [ 'server', 'userAgent', 'host', 'accessToken', 'collections' ]; break
    case 'MDP.DB': requiredFields = [ 'dbServer', 'dbName', 'collections' ]; break
  }
  
  for( let o = 0; o < requiredFields.length; o++ ){
    if( !config.hasOwnProperty( requiredFields[o] ) )
      throw new Error(`[${type}] <${requiredFields[o]}> configuration is required`)
  }
}
  
export const getOrigin = ( hreq: any ) => {
  const origin = typeof hreq == 'object' ?
                                hreq.headers.origin ?
                                        new URL( hreq.headers.origin ).hostname
                                        : hreq.headers.host
                                : ( hreq || '' ).replace(/http(s?):\/\//,'')

  return ( origin || '' ).replace(/:[0-9]{4,}/,'')
}

export const toCapitalCase = ( arg: string ) => {
  // Fonction de capitalisation du premier caractère d'un mot
  arg = arg.toLowerCase()
  
  const First = arg.charAt(0)
  return First.toUpperCase() + arg.split( new RegExp('^'+ First ) )[1]
}

export const debug = ( ...args: any ) => DEBUG_MODE && console.log( ...args )