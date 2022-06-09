

const request = require('request')

module.exports = config => {
  return ( verb, method, body ) => {
    return new Promise( ( resolve, reject ) => {
  
      if( typeof ( config || Globe_CSAConfig ) !== 'object' )
        return reject({ error: true, status: 'CSA-REQUEST::FAILED', message: 'Undefined Configuration' })
  
      const { baseURL, headers } = config || Globe_CSAConfig
      request(`${baseURL}/${verb}`, { headers, method, body, json: true, timeout: 8000 },
              ( error, resp, body ) => {
                if( error ) return reject({ error: true, status: 'CSA-REQUEST::FAILED', message: error })
                resolve( typeof body != 'string' ? body : { error: true, status: 'CSA-REQUEST::FAILED', message: body } )
              } )
    } )
  }
}