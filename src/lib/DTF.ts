/** -------------------------------------
 *  DTF: Delta To File (CDN Based File)
 ** --------------------------------------
 *
 * @version 1.0
 * @author Fabrice Marlboro
 * @copyright https://myapptech.com
 * 
 * - Convert JSON data to File and upload to CDN
 * - Fetch file from CDN and reverse to JSON data
*/
import CryptoJS from 'crypto-js'
import Randtoken from 'rand-token'

function reverse( str: string ){ 
  return str.split('').reverse().join('') 
}

export const toCDN = ( file: any, location: any, origin?: string ) => {
  return new Promise( ( resolve, reject ) => {

    const body = new FormData()
    body.append( 'file', file )
    
    window.fetch(`${origin}/assets/upload/${location || 'library'}`, { method: 'POST', body } )
          .then( res => res.json() )
          .then( resolve )
          .catch( reject )
  } )
}

export const fromCDN = ( url: string ) => {
  return new Promise( ( resolve, reject ) => {
    window.fetch( url ).then( res => res.text() )
          .then( resolve )
          .catch( reject )
  } )
}

/**
 * Serialize: Generate cryptojs compatiable encoding token
 *
 * @param mixed $arg
 * @param mixed $key
 * @return string
 */
const encode = ( arg: any, key: string ) => {

  key = key || '1234567890abCDEfgh'
  arg = reverse( JSON.stringify( arg ) )

  let
  str = CryptoJS.AES.encrypt( arg, key ).toString(),
  result = '',
  i = 0

  // Add random string of 8 length here
  str = Randtoken.generate(8) + str + Randtoken.generate(6)
  
  const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  do {
      let
      a = str.charCodeAt(i++),
      b = str.charCodeAt(i++),
      c = str.charCodeAt(i++)

      a = a ? a : 0
      b = b ? b : 0
      c = c ? c : 0

      let
      b1 = ( a >> 2 ) & 0x3F,
      b2 = ( ( a & 0x3 ) << 4 ) | ( ( b >> 4 ) & 0xF ),
      b3 = ( ( b & 0xF ) << 2 ) | ( ( c >> 6 ) & 0x3 ),
      b4 = c & 0x3F

      if( !b ) b3 = b4 = 64
      else if( !c ) b4 = 64

      result += b64.charAt( b1 ) + b64.charAt( b2 ) + b64.charAt( b3 ) + b64.charAt( b4 )

  } while ( i < str.length )
  
  return result
}

/**
 * Unserialize: Extract data from a CryptoJS encoding string (Token)
 *
 * @param string $str
 * @param string $key
 * @return object
 */
const decode = ( str: string, key: string ) => {
  // Default Reverse Encrypting Tool: Modified Base64 decoder
  key = key || '1234567890abCDEfgh'

  const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let 
  result = '',
  i = 0
  
  do {
    let
    b1 = b64.indexOf( str.charAt(i++) ),
    b2 = b64.indexOf( str.charAt(i++) ),
    b3 = b64.indexOf( str.charAt(i++) ),
    b4 = b64.indexOf( str.charAt(i++) ),

    a = ( ( b1 & 0x3F ) << 2 ) | ( ( b2 >> 4 ) & 0x3 ),
    b = ( ( b2 & 0xF  ) << 4 ) | ( ( b3 >> 2 ) & 0xF ),
    c = ( ( b3 & 0x3  ) << 6 ) | ( b4 & 0x3F )

    result += String.fromCharCode( a ) + ( b ? String.fromCharCode( b ) : '' ) + ( c ? String.fromCharCode( c ) : '' )
  } while( i < str.length )
  
  result = result.replace( result.slice( 0, 8 ), '' )
                  .replace( result.slice( result.length - 6 ), '' )

  result = CryptoJS.AES.decrypt( result, key ).toString( CryptoJS.enc.Utf8 )

  return JSON.parse( reverse( result ) )
}

/**
 * Write delta (JSON Data) as file to CDN
 *
 * @param object $delta
 * @param string $type
 * @return string
 */
export const write = async ( delta: any, type: string, origin?: string ) => {

  if( typeof delta !== 'object' || !type )
    return false

  try {
    const
    keygen = Randtoken.generate(58),
    strFile = `${encode( delta, keygen )}$${reverse(keygen)}`,
    { error, message, links }: any = await toCDN( new Blob( [ strFile ], { type: 'text/'+ type } ), false, origin )

    if( error ) throw new Error( message )
    return links[0]
  }
  catch( error ){
    console.log('Error: ', error )
    return null
  }
}

/**
 * Fetch CDN file and parse it to Delta (JSON Data)
 *
 * @param object $link
 * @return object
 */
export const read = async ( link: string ) => {
  try {
    const 
    strFile: any = await fromCDN( link ),
    [ content, key ] = strFile.split('$')

    if( !content || !key )
      throw new Error('Invalid File Content')
    
    return decode( content, reverse( key ) )
  }
  catch( error ){ 
    console.log('Error: ', error )
    return null 
  }
}

export default { write, read, toCDN, fromCDN }
