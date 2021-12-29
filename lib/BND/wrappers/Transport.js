
module.exports = to => {

  async function add( payload ){
    try { return await to( 'email/transport/add', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( transportId ){
    try { return await to( 'email/transport/'+ transportId, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit = 20, offset ){
    try { return await to( `email/transport/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( transportId, payload ){
    try { return await to( 'email/transport/update/'+ transportId, 'PUT', payload ) }
    catch( error ){ return error }
  }

  async function remove( transportId ){
    try { return await to( 'email/transport/delete/'+ transportId, 'DELETE' ) }
    catch( error ){ return error }
  }

  return {
    add,
    get,
    list,
    update,
    remove
  }
}