
const connect = require('./Connect')
const api = require('./APIWrapper')
const { checkConfig } = require('../../utils')

function config( config ){

  // Check whether all configuration field are defined
  checkConfig( 'WPS', config )
  
  /** Generate WPS request headers Object and 
   * make config available globally for any other 
   * WPS import in other module of the project
   */
  config.headers = {
                    'Origin': config.host,
                    'WPS-User-Agent': config.userAgent,
                    'WPS-Event-Provider': config.provider,
                    'WPS-Access-Token': config.accessToken
                  }

  global.Globe_WPSConfig = config
}

function setConfig( config ){

  if( typeof config != 'object' ) 
    return false

  // Update existing configuration
  Object.assign( global.Globe_WPSConfig, config )
  
  return true
}

module.exports = { config, setConfig, connect, api }