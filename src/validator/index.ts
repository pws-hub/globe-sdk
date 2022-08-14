import Pattern from './patterns'

const pattern = new Pattern()

// Middleway to check entry forms
export const checkFormSchema = ( schema: any ) => {

  return ( req: any, res: any, next: any ) => {

    if( !Array.isArray( schema ) ) return next()

    const form = [ 'GET' ].includes( req.method ) ? req.query : req.body
    let
    { requires, invalids }: any = validateSchema( schema, form ),
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
      console.error('[REQUEST SCHEMA VALIDATION ERROR]: '+ message )
      res.status(400).json({ error: true, status: 'REQUEST_FORM::INVALID', message })
    }
    else next() // valid form schema: proceed to next middleware of req callback function
  }
}

// Validate fields value with a defined pattern
export const validateField = ( ptrn: string, value: any ) => { return pattern.test( ptrn, value ) }

// validate form by type with pre-defined expected fields
export const validateSchema = ( schema: any, form: any, parent?: any ) => {

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

        schema[x].type.map( ( each: string ) => {
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

        const result: any = validateSchema( schema[x].schema, form[ schema[x].name ], parentKey + schema[x].name )

        ;[].push.apply( requires, result.requires )
        ;[].push.apply( invalids, result.invalids )
      }
    }

  return { requires, invalids }
}

export default { checkFormSchema, validateSchema, validateField }