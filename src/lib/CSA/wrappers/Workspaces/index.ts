
import members from './Members'
import projects from './Projects'

export default ( to: any ) => {

  async function create( payload: any ){
    try { return await to( 'workspaces/create', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( wid: string ){
    try { return await to( `workspaces/${wid}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit: number = 20, offset?: number ){
    try { return await to( `workspaces?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( wid: string, payload: any ){
    try { return await to( `workspaces/${wid}`, 'PATCH', payload ) }
    catch( error ){ return error }
  }

  async function remove( wid: string, reasons = {} ){
    try { return await to( `workspaces/${wid}`, 'DELETE', reasons ) }
    catch( error ){ return error }
  }

  return {
    create,
    get,
    list,
    update,
    remove,
    members: members( to ),
    projects: projects( to )
  }
}