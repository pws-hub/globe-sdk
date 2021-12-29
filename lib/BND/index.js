
const transport = require('./wrappers/Transport')
const template = require('./wrappers/Template')
const registry = require('./wrappers/Registry')
const send = require('./wrappers/Sender')
const Verb = require('./verb')
const { checkConfig } = require('../../utils')

module.exports = config => {

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
  const
  verb = Verb( config ),
  api = {
    send: send( verb ),
    registry: registry( verb ),
    template: template( verb ),
    transport: transport( verb )
  }

  return Object.assign( api, {
    
    setConfig( fields ){
      if( typeof fields != 'object' ) return false
      // Update existing configuration
      Object.assign( config, fields )

      return true
    },
    middleware: req => {
      if( typeof req != 'object' || !req.url ) return
      req.bnd = api
    }
  })
}