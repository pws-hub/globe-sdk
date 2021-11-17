
const To = require('../verb')

async function email( payload ){
  try { return await To( 'email/send', 'POST', payload ) }
  catch( error ){ return error }
}

async function SMS( payload ){
  try { return await To( 'sms/send', 'POST', payload ) }
  catch( error ){ return error }
}

module.exports = { email, SMS }