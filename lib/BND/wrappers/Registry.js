
module.exports = to => {

  async function create( payload ){
    try { return await to( 'registry/create', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( registryId ){
    try { return await to( 'registry/'+ registryId, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit = 20, offset ){
    try { return await to( `registry/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( registryId, payload ){
    try { return await to( 'registry/update/'+ registryId, 'PUT', payload ) }
    catch( error ){ return error }
  }

  async function remove( registryId ){
    try { return await to( 'registry/delete/'+ registryId, 'DELETE' ) }
    catch( error ){ return error }
  }

  return {
    create,
    get,
    list,
    update,
    remove
  }
}