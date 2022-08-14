
export default ( to: any ) => {

  async function email( payload: any ){
    try { return await to( 'email/send', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function SMS( payload: any ){
    try { return await to( 'sms/send', 'POST', payload ) }
    catch( error ){ return error }
  }

  return { email, SMS }
}