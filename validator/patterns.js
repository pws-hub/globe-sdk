
module.exports = function(){

		var THIS = this

		function extraSet( str ){
			var combines = str.split(/ ?: ?/)
			return combines.length == 2 ? combines : [ str, false ]
		}

		this.test = ( rule, value ) => {
			// execute a function related to the rule specified

			if( /-/.test( rule ) )
				return THIS.multipleIdentity( rule.split('-'), value ) // rule of multiple different type of value possible

			else {
				var pattern = extraSet( rule )
				return typeof THIS[ pattern[0] ] == 'function' ? THIS[ pattern[0] ]( value, pattern[1] ) : false // strict rule application
			}
		}

		this.multipleIdentity = ( list, value, extra ) => {
			// handle inputs that can have multiple different type of value possible
			// Can have: Email or phone or date or ...
			var state = false

			if( list.length )
				// test if the value correspond to one of the type of the list
				for( var o = 0; o < list.length; o++ ){
					var pattern = extraSet( list[o] )

					if( typeof THIS[ pattern[0] ] == 'function' && THIS[ pattern[0] ]( value, pattern[1] ) ){
						state = true
						break
					}
				}

			return state
		}


		this.required = ( value ) => {
			// validate an email

			return /[a-zA-Z0-9]/.test( value )
		}

		this.url = ( value ) => {
			// validate an email

			return /^((http|https|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test( value )
		}

		this.email = ( value ) => {
			// validate an email

			return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/i.test( value )
		}

		this.phone = ( value ) => {
			// validate an email

			return THIS.number && /\d{7,}|(\d{2,} ) => {3,}/.test( value )
		}

		this.date = ( value ) => {
			// validate an email

			// return /^((http|https|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test( value )
		}

		this.fullname = ( value ) => {
			// validate a full name ( two word minimum )

			return /[a-zA-Z]/.test( value ) && value.split(' ').length > 1
		}

		this.confirm = ( value, itemID ) => {
			// confirm when two same type of input have the same value
			// like password, email confirmation ...

			return $('#'+ itemID ).val() === value
		}

		this.number = ( value ) => {
			// validate a number
			return typeof value == 'number' || !/[a-zA-Z]/.test( value )
		}

		this.boolean = ( value ) => {
			// validate a boolean words
			return typeof value == 'boolean'
		}

		this.string = ( value ) => {
			// validate a string words
			return typeof value == 'string'
		}

		this.array = ( value ) => {
			// validate an array
			return Array.isArray( value )
		}

		this.object = ( value ) => {
			// validate an object
			return typeof value == 'object' && !Array.isArray( value )
		}

		this.password = ( value, type ) => {
			// validate a string words

				var TYPES = { weak: 1, medium: 2, strong: 3, perfect: 4 },
						stars = 0,
						status

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

		this.length = ( value, size ) => {
			// validate a length of characters in the value

			return value.length == parseInt( size )
		}

		this.minLength = ( value, size ) => {
			// validate value superior to min size specified

			return value.length >= parseInt( size )
		}

		this.maxLength = ( value, size ) => {
			// validate value inferior to max size specified

			return value.length <= parseInt( size )
		}

		return this
}
