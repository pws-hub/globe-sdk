
import request from 'request'
import type { BNDConfig } from '../../types/bnd'

export default ( config: BNDConfig ) => {
  return ( verb: string, method: string, body: any ) => {
    return new Promise( ( resolve, reject ) => {
  
      if( typeof ( config || Globe_BNDConfig ) !== 'object' )
        return reject({ error: true, status: 'BND-REQUEST::FAILED', message: 'Undefined Configuration' })
  
      const { server, headers } = config || Globe_BNDConfig
      request(`${server}/${verb}`, { headers, method, body, json: true, timeout: 8000 },
              ( error, resp, body ) => {
                if( error ) return reject({ error: true, status: 'BND-REQUEST::FAILED', message: error })
                resolve( typeof body != 'string' ? body : { error: true, status: 'BND-REQUEST::FAILED', message: body } )
              } )
    } )
  }
}