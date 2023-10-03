
import connect from './Connect'
import api from './APIWrapper'
import { checkConfig } from '../../utils'
import type { WPSConfig } from '../../types/wps'

const config = ( config: WPSConfig ) => {

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

const setConfig = ( config: WPSConfig ) => {

  if( typeof config != 'object' ) 
    return false

  // Update existing configuration
  Object.assign( global.Globe_WPSConfig, config )
  
  return true
}

export default { config, setConfig, connect, api }