
import workspaces from './wrappers/Workspaces'
import Verb from './verb'
import { checkConfig } from '../../utils'
import { Config } from './types'

declare global {
  var Globe_CSAConfig: Config
}

export const config = ( config: Config ) => {

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

    setConfig( fields: any ){
      if( typeof fields != 'object' ) return false
      // Update existing configuration
      Object.assign( config, fields )

      return true
    },
    middleware: ( req: any, res: any, next: any ) => {
      if( typeof req != 'object' || !req.url ) return
      req.csa = api

      next()
    }
  })
}