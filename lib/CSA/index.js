
const workspaces = require('./wrappers/Workspaces')
const Verb = require('./verb')
const { checkConfig } = require('../../utils')

function config( config ){

  // Check whether all configuration field are defined
  checkConfig( 'CSA', config )
  
  /** Generate CSA request headers Object and 
   * make config available globally for any other 
   * CSA import in other module of the project
   */
  config.headers = {
    'Authorization': 'Bearer '+ config.accessToken,
    'Content-Type': 'application/json'
  }

  global.Globe_CSAConfig = config
  const
  verb = Verb( config ),
  api = {
    workspaces: workspaces( verb )
  }

  return Object.assign( api, {

    setConfig( fields ){
      if( typeof fields != 'object' ) return false
      // Update existing configuration
      Object.assign( config, fields )

      return true
    },
    middleware: ( req, res, next ) => {
      if( typeof req != 'object' || !req.url ) return
      req.csa = api

      next()
    }
  })
}

module.exports = { config }