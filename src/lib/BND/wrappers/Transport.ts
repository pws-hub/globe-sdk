
export default ( to: any ) => {

  async function add( payload: any ){
    try { return await to( 'email/transport/add', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( transportId: string ){
    try { return await to( 'email/transport/'+ transportId, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit: number = 20, offset?: number ){
    try { return await to( `email/transport/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( transportId: string, payload: any ){
    try { return await to( 'email/transport/update/'+ transportId, 'PUT', payload ) }
    catch( error ){ return error }
  }

  async function remove( transportId: string ){
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