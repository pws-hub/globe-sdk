
const members = require('./Members')
const projects = require('./Projects')

module.exports = to => {

  async function create( payload ){
    try { return await to( 'workspaces/create', 'POST', payload ) }
    catch( error ){ return error }
  }

  async function get( wid ){
    try { return await to( `workspaces/${wid}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function list( limit = 20, offset ){
    try { return await to( `workspaces?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
    catch( error ){ return error }
  }

  async function update( wid, payload ){
    try { return await to( `workspaces/${wid}`, 'PATCH', payload ) }
    catch( error ){ return error }
  }

  async function remove( wid, reasons = {} ){
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