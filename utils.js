
module.exports = {
  
  checkConfig: ( type, config ) => {

    if( !config )
      throw new Error(`[${type}] No configuration defined`)
  
    if( typeof config !== 'object' )
      throw new Error(`[${type}] Invalid configuration`)

    let requiredFields
    switch( type ){
      case 'APS': requiredFields = [ 'baseURL', 'provider' ]; break
      case 'WPS': requiredFields = [ 'userAgent', 'server', 'provider', 'accessToken' ]; break
      case 'MDP.DS': requiredFields = [ 'userAgent', 'server', 'host', 'accessToken', 'collections' ]; break
      case 'MDP.DB': requiredFields = [ 'dbServer', 'dbName', 'collections' ]; break
    }
    
    for( let o = 0; o < requiredFields.length; o++ ){
      if( !config.hasOwnProperty( requiredFields[o] ) )
        throw new Error(`[${type}] <${requiredFields[o]}> configuration is required`)
    }
  }
}