

const request = require('request')

module.exports = config => {
  return ( verb, method, body ) => {
    return new Promise( ( resolve, reject ) => {
  
      if( typeof ( config || Globe_BNDConfig ) !== 'object' )
        return reject({ error: true, status: 'BND-REQUEST::FAILED', message: 'Undefined Configuration' })
  
      const { server, headers } = config || Globe_BNDConfig
      request(`${server}/${verb}`, { headers, method, body, json: true },
              ( error, resp, body ) => {
                if( error ) return reject({ error: true, status: 'BND-REQUEST::FAILED', message: error })
                resolve( typeof body != 'string' ? body : { error: true, status: 'BND-REQUEST::FAILED', message: body } )
              } )
    } )
  }
}