import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import FPlugin from 'fastify-plugin'
import transport from './wrappers/Transport'
import template from './wrappers/Template'
import registry from './wrappers/Registry'
import send from './wrappers/Sender'
import Verb from './verb'
import { checkConfig } from '../../utils'
import type { BNDConfig } from '../../types/bnd'

function config( config: BNDConfig ){

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
  
  return {
    ...api,
    
    setConfig: ( fields: any ) => {
      if( typeof fields != 'object' ) return false
      // Update existing configuration
      Object.assign( config, fields )

      return true
    },
    express: ( req: any, res: any, next: any ) => {
      if( typeof req != 'object' || !req.url ) return
      req.bnd = api

      next()
    },
    fastify: () => {
      return FPlugin( async ( App: FastifyInstance ) => {
        App.addHook( 'onRequest', async req => {
          if( typeof req != 'object' || !req.url ) return
          req.bnd = api
        } )
      } ) as FastifyPluginAsync
    }
  }
}

export default { config }