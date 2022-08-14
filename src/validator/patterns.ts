import { Boolean } from "aws-sdk/clients/batch"

function extraSet( str: string ){
	var combines = str.split(/ ?: ?/)
	return combines.length == 2 ? combines : [ str, false ]
}

export default class Pattern {

	[index: string]: any
	
	test( rule: string, value: any ){
		// execute a function related to the rule specified

		if( /-/.test( rule ) )
			return this.multipleIdentity( rule.split('-'), value ) // rule of multiple different type of value possible

		else {
			var pattern = extraSet( rule )
			return typeof this[ pattern[0] as string ] == 'function' ? this[ pattern[0] as string ]( value, pattern[1] ) : false // strict rule application
		}
	}

	multipleIdentity( list: string[], value: any, extra?: any ){
		// handle inputs that can have multiple different type of value possible
		// Can have: Email or phone or date or ...
		var state = false

		if( list.length )
			// test if the value correspond to one of the type of the list
			for( var o = 0; o < list.length; o++ ){
				var pattern = extraSet( list[o] )

				if( typeof this[ pattern[0] as string ] == 'function' && this[ pattern[0] as string ]( value, pattern[1] ) ){
					state = true
					break
				}
			}

		return state
	}


	required( value: any ){
		// validate
		return /[a-zA-Z0-9]/.test( value )
	}

	url( value: any ){
		// validate a url
		return /^((http|https|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test( value )
	}

	email( value: string ){
		// validate an email
		return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/i.test( value )
	}

	phone( value: string | number ){
		// validate a phone number
		return /\d{7,}|(\d{2,} ) => {3,}/.test( String( value ) )
	}

	date = ( value: any ) => {
		// validate a date
		// return /^((http|https|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test( value )
	}

	fullname( value: string ){
		// validate a full name ( two word minimum )
		return /[a-zA-Z]/.test( value ) && value.split(' ').length > 1
	}
	
	number( value: any ){
		// validate a number
		return typeof value == 'number' || !/[a-zA-Z]/.test( value )
	}

	boolean( value: Boolean ){
		// validate a boolean words
		return typeof value == 'boolean'
	}

	string( value: string ){
		// validate a string words
		return typeof value == 'string'
	}

	array( value: any ){
		// validate an array
		return Array.isArray( value )
	}

	object( value: any ){
		// validate an object
		return typeof value == 'object' && !Array.isArray( value )
	}

	password( value: any, type: 'weak' | 'medium' | 'strong' | 'perfect' ){
		// validate a string words

		var TYPES = { weak: 1, medium: 2, strong: 3, perfect: 4 },
				stars = 0,
				status: any

		// Determine the level of password
		if( /(?=.*[a-z].*[a-z].*[a-z])/.test( value ) ) stars++ // required string characters

		if( /(?=.*[!@#$&*])/.test( value ) ) stars++ // required at least one special characters

		if( /(?=.*[A-Z].*[A-Z])/.test( value ) ) stars++ // required at least one capital characters

		if( /(?=.*[0-9].*[0-9])/.test( value ) ) stars++ // required numbers

		if( /.{12,20}/.test( value ) ) stars += 2  // should length between 12 - 20 characters as long and strong password

		else if( /.{8,12}/.test( value ) ) stars++ // should length between 8 - 12 characters as standard

		// Redable password status
		if( stars >= 0 && stars < 2 ) status = { type: 'weak', indice: 1 }
		else if( stars >= 2 && stars < 4 ) status = { type: 'medium', indice: 2 }
		else if( stars >= 4 && stars < 6 ) status = { type: 'strong', indice: 3 }
		else if( stars >= 6 ) status = { type: 'perfect', indice: 4 }

		return TYPES.hasOwnProperty( type ) && TYPES[ type ] <= status.indice
	}

	length( value: any, size: any ){
		// validate a length of characters in the value
		return value.length == parseInt( size )
	}

	minLength( value: any, size: any ){
		// validate value superior to min size specified
		return value.length >= parseInt( size )
	}

	maxLength( value: any, size: any ){
		// validate value inferior to max size specified
		return value.length <= parseInt( size )
	}
}
