
/** Data-Provider Interface/Driver

  Gives a more friendly interface to connect and make mongodb database
  queries and also help switch an application from external Data Provider
  Server connection to normal database connection without changing
  any query code.
  
  @author Fabrice Marlboro

  @params collections (Array) List of collections, subject of query
                      transactions or use function "arguments" as alternative

  WARNING: Requires environment variable (in .env file) like:
    - DATABASE_URL = Connection String (URL) of the mongodb database
    - DATABASE_NAME = Name of targeted database
*/
import { ObjectId } from 'mongodb'
import { toCapitalCase } from '../../utils'
import type { MDPConfig, Process, AnyObject } from '../../types/mdp'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import FPlugin from 'fastify-plugin'

const
STypes = [ 'one', 'many', 'all' ],

isEmpty = ( entry: any ) => {
  // test empty array or object
  if( !entry || typeof entry !== 'object' ) return null

  return Array.isArray( entry ) ?
              !entry.length
              : Object.keys( entry ).length === 0 && entry.constructor === Object
},
depthField = ( data: any, field: string ) => {

  const depths = field.split('.')
  let depthValue = JSON.parse( JSON.stringify( data ) )

  for( let o = 0; o < depths.length; o++ ){
    if( depths[o] == '$' && typeof depthValue == 'object' )
      return {
              objectValue: depthValue,
              matchField: depths.slice( o + 1 ).join('.')
            }

    if( !depthValue.hasOwnProperty( depths[o] ) )
      return null

    depthValue = depthValue[ depths[o] ]
  }

  return depthValue
},
extendData = async ( dbClient: any, result: any, options: any, index = 0 ): Promise<Process> => {

  let
  process: Process = { error: false, final: {} },
  { field, to, as, maxdepth, select, excludes } = options

  maxdepth = maxdepth || 1 // Fisrt deep level by default

  if( Array.isArray( result ) ){

    if( !result.length ) // Empty array send to extend
      return { error: false, final: result }

    process.data = result[ index ]
  }
  else process.data = result

  if( field ){
    /* Single field only
    "extend": {
          "field": "user_id",
          "to": "user._id",
          "as": "profile"
      }
    */
    if( !to || !/\./.test( to ) ){
      process.error = { error: false, status: 'QUERY::FAILED', message: 'Invalid Join Set: "to" expected (Eg. user._id)' }
      return process
    }

    const
    toSplited = to.split('.'),
    table = toSplited.shift(),
    tField = toSplited.join('.'),
    DBCollection = dbClient.collection( table )

    if( !DBCollection ){
      process.error = { error: false, status: 'QUERY::FAILED', message: 'Unknown Tenant' }
      return process
    }

    let value = tField == '_id' ?
                    new ObjectId( process.data[ field ] )
                    : depthField( process.data, field )

    let exclusion: AnyObject = {}

    if( Array.isArray( select ) || Array.isArray( excludes ) ){
      select && select.map( ( each: string ) => exclusion[ each ] = 1 )
      excludes && excludes.map( ( each: string ) => exclusion[ each ] = 0 )
    }

    const findMatche = async ( value: any, index?: any ) => {

      const found = await DBCollection.findOne({ [ tField ]: value }, exclusion )
      // console.log( 'table: ', table, 'tField: ', tField, 'value: ', value, 'found: ', found )

      let asField = as || field

      if( index !== undefined ){
        index = typeof index != 'number' ? '"'+ index +'"' : index // object key or array index
        asField = asField.replace('.$', '['+ index +']' )
      }

      try { eval( 'process.data.'+ asField +' = found' ) }
      catch( error ){ console.log('Depth Assigning of '+ asField +' Failed: ', error ) }
    }

    if( value && typeof value == 'object' ){

      const { objectValue, matchField } = value
      let isObject = false

      if( !Array.isArray( objectValue ) ){
        // Object of matches to find
        isObject = true
        value = matchField ?
                    // Match object entries fields
                    Object.entries( objectValue )
                    // Match object keys fields
                    : Object.keys( objectValue )
      }
      // Matche array contents
      else value = objectValue


      for( let idx = 0; idx < value.length; idx++ )
        Array.isArray( value[ idx ] ) && value[ idx ].length == 2 ?
              await findMatche( matchField ? depthField( value[ idx ][1], matchField ) : value[ idx ][1],
                                value[ idx ][0] ) // Object entries
              : await findMatche( matchField ? depthField( value[ idx ], matchField ) : value[ idx ],
                                  isObject ? value[ idx ] : idx ) // Normal Array
    }
    else await findMatche( value )
  }
  else if( maxdepth ){
    let foundField

    // Find extendable field
    for( let each in process.data )
      if( /(\w+)_id$/.test( each ) ){
        foundField = each
        break
      }

    if( foundField ){
      await extendData( dbClient, process.data, { field: foundField, to: foundField.replace('_id','') +'._id', maxdepth } )
      return await extendData( dbClient, result, options, index )
    }
  }

  if( Array.isArray( result ) && result[ index + 1 ] )
    return await extendData( dbClient, result, options, index + 1 )

  return { error: process.error, final: result }
}

class Query {
  
  private table: string
  private dbClient: any
  private DBCollection: any

  constructor( table: string, dbClient: any ){
    this.table = table
    this.dbClient = dbClient
    this.DBCollection = dbClient.collection( table )
  }

  async insert( data: any, operators: any = {} ){

    if( !data
        || typeof data != 'object'
        || isEmpty( data ) )
      throw new Error('Invalid Insertion Data Argument')

    try {
      const
      { returnId } = operators,
      result = Array.isArray( data ) ?
                        await this.DBCollection.insertMany( data )
                        : await this.DBCollection.insertOne( data ),
      sResponse: any = { error: false, status: 'QUERY::SUCCESS', message: 'Insert' }

      // Return Inserted Doc "_id"
      if( returnId )
        sResponse.result = result.insertedId
        
      if( result && result.acknowledged ) return sResponse
      else throw new Error('Unexpected Error Occurs')
    }
    catch( error ){
      console.error( 'Insert Query: ', error )
      throw new Error('- '+ error )
    }
  }

  async find( conditions: any, operators: any = {}, target?: string ){

    if( !conditions || typeof conditions != 'object' )
      throw new Error('Invalid Query Condition Argument')

    try {
      let
      { select, excludes, limit, desc, orderby, extend, count } = operators,
      fn = target == 'one' ? 'findOne' : 'find',
      result

      conditions = conditions || {} // default condition

      const exclusion: AnyObject = {}

      if( Array.isArray( select )
          || Array.isArray( excludes ) ){
        select && select.map( ( each: string ) => exclusion[ each ] = 1 )
        excludes && excludes.map( ( each: string ) => exclusion[ each ] = 0 )

        result = await this.DBCollection[ fn ]( conditions, exclusion )
      }
      else result = await this.DBCollection[ fn ]( conditions )

      // when "find" or "findMany"
      if( target != 'one' ){
        if( orderby ) // Order By a selected field: Desc or not
          result = await result.sort({ [ orderby ]: desc ? -1 : 1 })
        else if( desc ) // Desc only target "_id"
          result = await result.sort({ _id: -1 })

        if( limit ) result = result.limit( limit )

        result = await result.toArray()
      }

      // console.log( result )
      // Tree mapping operation
      if( result && extend ){
        const { error, final } = await extendData( this.dbClient, result, extend )

        if( error ) return error
        result = final
      }

      // Return only the result count
      if( count )
        result = result.length || ( target == 'one' ? 1 : 0 )

      return result
    }
    catch( error ){
      console.error( 'Find Query: ', error )
      throw new Error('- '+ error )
    }
  }
  async findOne( conditions: any, operators: any = {} ){ return await this.find( conditions, operators, 'one' ) }

  async update( conditions: any, data: any, operators: any = {}, target?: string ){

    if( !data
        || typeof data != 'object'
        || isEmpty( data ) )
      throw new Error('Invalid Query Data Argument')

    if( !conditions || typeof conditions != 'object' )
      return 'Invalid Query Condition Argument'

    try {
      let
      { select, excludes, upsert, returnUpdate, arrayFilters } = operators,
      fn = target && STypes.includes( target ) ? 'update'+ toCapitalCase( target ) : 'updateOne',
      toUpdate: AnyObject = {},
      result

      // Aggregation update
      if( Array.isArray( data ) ) toUpdate = data
      // Normal update
      else {
        if( data.hasOwnProperty('$set') ){
          toUpdate['$set'] = data['$set']
          delete data['$set']
        }
        if( data.hasOwnProperty('$unset') ){
          toUpdate['$unset'] = data['$unset']
          delete data['$unset']
        }
        if( data.hasOwnProperty('$push') ){
          toUpdate['$push'] = data['$push']
          delete data['$push']
        }
        if( data.hasOwnProperty('$pull') ){
          toUpdate['$pull'] = data['$pull']
          delete data['$pull']
        }
        if( data.hasOwnProperty('$addToSet') ){
          toUpdate['$addToSet'] = data['$addToSet']
          delete data['$addToSet']
        }
        if( data.hasOwnProperty('$inc') ){
          toUpdate['$inc'] = data['$inc']
          delete data['$inc']
        }

        // Merge the remain content in data as "toSet"
        toUpdate['$set'] = Object.assign( toUpdate['$set'] || {}, data )
        // Avoid mongodb "empty $set" error
        isEmpty( toUpdate['$set'] ) && delete toUpdate['$set']
      }

      // Proceed to Special operators setup
      const superOps: AnyObject = {}

      if( upsert || returnUpdate || arrayFilters ){
        // Auto-create new document if there's none to update
        if( upsert ) superOps.upsert = true
        if( arrayFilters ) superOps.arrayFilters = arrayFilters

        // About returning the update value of this document
        if( returnUpdate ){
          superOps.returnDocument = 'after'

          if( Array.isArray( select )
              || Array.isArray( excludes ) ){

            superOps.projection = {}

            select && select.map( ( each: string ) => superOps.projection[ each ] = 1 )
            excludes && excludes.map( ( each: string ) => superOps.projection[ each ] = 0 )
          }

          const { value } = await this.DBCollection.findOneAndUpdate( conditions, toUpdate, superOps )
          return value
        }

        result = await this.DBCollection[ fn ]( conditions, toUpdate, superOps )
      }
      else result = await this.DBCollection[ fn ]( conditions, toUpdate )

      if( result && result.acknowledged )
        return !result.modifiedCount ? 'Already Up-to-date' : 'Updated'
      else throw new Error('Not Found')
    }
    catch( error ){
      console.error( 'Find Query: ', error )
      throw new Error('- '+ error )
    }
  }
  async updateOne( conditions: any, data: any, operators: any = {} ){ return await this.update( conditions, data, operators, 'one' ) }
  async updateMany( conditions: any, data: any, operators: any = {} ){ return await this.update( conditions, data, operators, 'many' ) }

  async delete( conditions: any, operators: any = {}, target?: string ){
    /* NOTE: Upcoming operator
      - archive {boolean} MDP will push the item to
                archived collection instead of totally delete it
    */
    if( !conditions || typeof conditions != 'object' )
      throw new Error('Invalid Query Condition Argument')

    try {
      let fn = target && STypes.includes( target ) ? 'delete'+ toCapitalCase( target ) : 'remove'
      const result = await this.DBCollection[ fn ]( conditions )

      if( result && result.acknowledged )
        return !result.deletedCount ? 'Nothing to delete' : 'Deleted'
      else throw new Error('Not Found')
    }
    catch( error ){
      console.error( 'Find Query: ', error )
      throw new Error('- '+ error )
    }
  }
  async deleteOne( conditions: any, operators: any = {} ){ return await this.delete( conditions, operators, 'one' ) }
  async deleteMany( conditions: any, operators: any = {} ){ return await this.delete( conditions, operators, 'many' ) }

  // Find and only return the count of the result
  async count( conditions: any, operators: any = {} ){ return await this.find( conditions, Object.assign( operators || {}, { count: true } ) ) }

  // Massive aggregation pipeline
  async aggregate( stages: any ){

    if( !stages || typeof stages != 'object' )
      throw new Error('Invalid Aggregation Stage Argument')

    try { return await this.DBCollection.aggregate( stages ).toArray() }
    catch( error ){
      console.error( 'Aggregation Query: ', error )
      throw new Error('- '+ error )
    }
  }
  // Drop collection
  async drop(){
    try { return await this.DBCollection.drop() ? 'Dropped' : 'Not Dropped' }
    catch( error ){
      console.error( 'Drop Collection Query: ', error )
      throw new Error('- '+ error )
    }
  }
}

function dbConnect( config: MDPConfig ){
  return new Promise( ( resolve, reject ) => {

    let { dbServer, dbName, collections } = config

    require('mongodb')
    .MongoClient
    .connect( dbServer, { useNewUrlParser: true, useUnifiedTopology: true },
              ( error: any, client: any ) => {
                // On connection error we display then exit
                if( error ){
                  reject('Error connecting to MongoDB: '+ error )
                  return
                }

                const
                dbClient = client.db( dbName ),
                api: AnyObject = {}

                resolve({
                    collections,
                    dp: () => {
                      // Assign each collection as Query Object to DBInterface
                      Array.isArray( collections )
                      && collections.map( each => api[ each ] = new Query( each, dbClient ) )

                      return api
                    },
                    express: async ( req: any, res: any, next: any ) => {
                      // Assign each collection as Query Object to DBInterface
                      Array.isArray( collections )
                      && collections.map( each => api[ each ] = new Query( each, dbClient ) )

                      req.dp = api
                      next()
                    },
                    fastify: () => {
                      return FPlugin( async ( App: FastifyInstance ) => {
                        App.addHook( 'onRequest', async req => {
                          // Assign each collection as Query Object to DBInterface
                          Array.isArray( collections )
                          && collections.map( each => api[ each ] = new Query( each, dbClient ) )

                          req.dp = api
                        } )
                      } ) as FastifyPluginAsync
                    }
                })
            } )
  } )
}

export default ( config: MDPConfig ) => dbConnect( config )