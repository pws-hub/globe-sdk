
const transport = require('./wrappers/Transport')
const template = require('./wrappers/Template')
const registry = require('./wrappers/Registry')
const send = require('./wrappers/Sender')
const { checkConfig } = require('../../utils')

function config( config ){

  // Check whether all configuration field are defined
  checkConfig( 'BND', config )
  
  /** Generate BND request headers Object and 
   * make config available globally for any other 
   * BND import in other module of the project
   */
  config.headers = {
                    'Origin': config.host,
                    'BND-User-Agent': config.userAgent,
                    'BND-Application': config.application,
                    'BND-Access-Token': config.accessToken
                  }

  global.Globe_BNDConfig = config
}

function setConfig( config ){

  if( typeof config != 'object' ) 
    return false

  // Update existing configuration
  Object.assign( global.Globe_BNDConfig, config )
  
  return true
}

module.exports = { 
  config, 
  setConfig,
  send,
  registry,
  template, 
  transport
}