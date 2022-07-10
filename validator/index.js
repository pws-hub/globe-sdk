
const Pattern = require('./patterns')

const pattern = new Pattern()

// Middleway to check entry forms
const checkFormSchema = schema => {

  return ( req, res, next ) => {

    if( !Array.isArray( schema ) ) return next()

    const form = [ 'GET' ].includes( req.method ) ? req.query : req.body
    let
    { requires, invalids } = validateSchema( schema, form ),
    message = '',
    ERROR_FOUND = false,
    isLot

    if( Array.isArray( requires ) && requires.length ){
      // no defined but requried
      isLot = requires.length > 1
      message += 'The Field'+( isLot ? 's' : '' )+' "'+ requires.join(',')+'" '+( isLot ? 'are' : 'is' )+' required'
      ERROR_FOUND = true
    }

    if( Array.isArray( invalids ) && invalids.length ){
      // wrong format set
      isLot = invalids.length > 1
      message += ( ERROR_FOUND ? ' And ' : 'The Field'+( isLot ? 's ' : ' ' ) )
                  +'"'+ invalids.join(',')+'" formats '+( isLot ? 'are' : 'is' )+' invalid'
      ERROR_FOUND = true
    }

    if( ERROR_FOUND ){
      console.error( clc.red( '[REQUEST SCHEMA VALIDATION ERROR]: '+ message ) )
      res.status(400).json({ error: true, status: 'REQUEST_FORM::INVALID', message })
    }
    else next() // valid form schema: proceed to next middleware of req callback function
  }
}

// Validate fields value with a defined pattern
const validateField = ( ptrn, value ) => { return pattern.test( ptrn, value ) }

// validate form by type with pre-defined expected fields
const validateSchema = ( schema, form, parent ) => {

  const
  requires = [],
  invalids = [],
  parentKey = parent ? parent +'.' : ''

  if( !Array.isArray( schema ) || !form ) return false

  if( schema.length )
    for( var x = 0; x < schema.length; x++ ){
      // Optional state
      if( !form[ schema[x].name ] )
        !schema[x].optional ? requires.push( parentKey + schema[x].name ) : null

      // Multi-type possible
      else if( Array.isArray( schema[x].type ) ){
        let oneValid = false

        schema[x].type.map( each => {
          if( pattern.test( each, form[ schema[x].name ] ) )
            oneValid = true
        } )

        !oneValid && invalids.push( parentKey + schema[x].name )
      }

      // Single type
      else if( !pattern.test( schema[x].type, form[ schema[x].name ] ) )
        invalids.push( parentKey + schema[x].name )


      // Also validate deep object field with a given schema
      if( schema[x].type == 'object' && Array.isArray( schema[x].schema ) ){

        const result = validateSchema( schema[x].schema, form[ schema[x].name ], parentKey + schema[x].name )

        ;[].push.apply( requires, result.requires )
        ;[].push.apply( invalids, result.invalids )
      }
    }

  return { requires, invalids }
}

module.exports = { checkFormSchema, validateSchema, validateField }