

const request = require('request')

module.exports = ( verb, method, body ) => {
  return new Promise( ( resolve, reject ) => {

    if( typeof Globe_BNDConfig !== 'object' )
      return reject({ error: true, status: 'BND-REQUEST::FAILED', message: 'Undefined Configuration' })

    const { server, headers } = Globe_BNDConfig
    request(`${server}/v1/${verb}`, { headers, method, body, json: true },
            ( error, resp, body ) => {
              if( error ) return reject({ error: true, status: 'BND-REQUEST::FAILED', message: error })
              resolve( typeof body != 'string' ? body : { error: true, status: 'BND-REQUEST::FAILED', message: body } )
            } )
  } )
}