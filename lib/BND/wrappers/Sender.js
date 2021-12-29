
module.exports = to => {

  async function email( payload ){
    try { return await to( 'email/send', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function SMS( payload ){
    try { return await to( 'sms/send', 'POST', payload ) }
    catch( error ){ return error }
  }

  return { email, SMS }
}