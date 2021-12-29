
module.exports = to => {

  async function create( payload ){
    try { return await to( 'template/create', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( templateId ){
    try { return await to( 'template/'+ templateId, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit = 20, offset ){
    try { return await to( `template/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( templateId, payload ){
    try { return await to( 'template/update/'+ templateId, 'PUT', payload ) }
    catch( error ){ return error }
  }

  async function remove( templateId ){
    try { return await to( 'template/delete/'+ templateId, 'DELETE' ) }
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