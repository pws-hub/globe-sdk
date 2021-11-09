
module.exports = {
  
  checkConfig: ( type, config ) => {

    if( !config )
      throw new Error(`[${type}] No configuration defined`)
  
    if( typeof config !== 'object' )
      throw new Error(`[${type}] Invalid configuration`)

    let requiredFields
    switch( type ){
      case 'APS': requiredFields = [ 'baseURL', 'provider' ]; break
      case 'WPS': requiredFields = [ 'userAgent', 'server', 'provider', 'token' ]; break
    }
    
    for( let o = 0; o < requiredFields.length; o++ ){
      if( !config.hasOwnProperty( requiredFields[o] ) )
        throw new Error(`[${type}] <${requiredFields[o]}> configuration is required`)
    }
  }
}