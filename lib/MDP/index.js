
/** Data Query Interface/Driver

  Give a simple interface that reduce the hassle of making
  traditional API request and its params to a MongoDB Database
  or and external Data-Provider server.
  
  @author Fabrice Marlboro
  @date 31/03/2021
  
*/
const DBInterface = require('./DB')
const DSInterface = require('./DS')
const { checkConfig } = require('../../utils')

function config( type, options ){

  // Check whether all configuration field are defined
  checkConfig( 'MDP.'+ type.toUpperCase(), options )

  switch( type.toLowerCase() ){
    // Data Provider (External Server)
    case 'ds': return new DSInterface( options )

    // DataBase (Internal Connection to database)
    case 'db':
    default: return DBInterface( options )
  }
}

module.exports = { config }
