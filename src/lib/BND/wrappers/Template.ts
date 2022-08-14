
export default ( to: any ) => {

  async function create( payload: any ){
    try { return await to( 'template/create', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( templateId: string ){
    try { return await to( 'template/'+ templateId, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit: number = 20, offset?: number ){
    try { return await to( `template/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( templateId: string, payload: any ){
    try { return await to( 'template/update/'+ templateId, 'PUT', payload ) }
    catch( error ){ return error }
  }

  async function remove( templateId: string ){
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