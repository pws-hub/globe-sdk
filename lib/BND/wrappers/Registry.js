
const To = require('../verb')

async function create( payload ){
  try { return await To( 'registry/create', 'POST', payload ) }
  catch( error ){ return error }
}

async function get( registryId ){
  try { return await To( 'registry/'+ registryId, 'GET' ) }
  catch( error ){ return error }
}

async function list( limit = 20, offset ){
  try { return await To( `registry/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
  catch( error ){ return error }
}

async function update( registryId, payload ){
  try { return await To( 'registry/update/'+ registryId, 'PUT', payload ) }
  catch( error ){ return error }
}

async function remove( registryId ){
  try { return await To( 'registry/delete/'+ registryId, 'DELETE' ) }
  catch( error ){ return error }
}

module.exports = {
  create,
  get,
  list,
  update,
  remove
}