
/** Data Query Interface/Driver

  Give a simple interface that reduce the hassle of making
  traditional API request and its params to a MongoDB Database
  or and external Data-Provider server.
  
  @author Fabrice Marlboro
  @date 31/03/2021
  
*/
import DBInterface from './DB'
import DSInterface from './DS'
import { checkConfig } from '../../utils'
import type { MDPConfig } from '../../types/mdp'

export const config = ( type: string, options: MDPConfig ) => {
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

export default { config }