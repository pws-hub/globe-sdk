
export default ( to: any ) => {

  async function create( payload: any ){
    try { return await to( 'registry/create', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( registryId: string ){
    try { return await to( 'registry/'+ registryId, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit: number = 20, offset?: number ){
    try { return await to( `registry/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( registryId: string, payload: any ){
    try { return await to( 'registry/update/'+ registryId, 'PUT', payload ) }
    catch( error ){ return error }
  }

  async function remove( registryId: string ){
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