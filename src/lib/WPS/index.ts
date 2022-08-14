
import connect from './Connect'
import api from './APIWrapper'
import { checkConfig } from '../../utils'

type Config = {
  server: string
  host: string
  userAgent: string
  provider: string
  accessToken: string
  headers: { [index: string]: string }
  sendVerb?: string
}

declare global {
  var Globe_WPSConfig: Config
}

const config = ( config: Config ) => {

  // Check whether all configuration field are defined
  checkConfig( 'WPS', config )
  
  /** Generate WPS request headers Object and 
   * make config available globally for any other 
   * WPS import in other module of the project
   */
  config.headers = {
    'Origin': `//${config.host}`,
    'WPS-User-Agent': config.userAgent,
    'WPS-Event-Provider': config.provider,
    'WPS-Access-Token': config.accessToken
  }

  global.Globe_WPSConfig = config
}

const setConfig = ( config: Config ) => {

  if( typeof config != 'object' ) 
    return false

  // Update existing configuration
  Object.assign( global.Globe_WPSConfig, config )
  
  return true
}

export { config, setConfig, connect, api }