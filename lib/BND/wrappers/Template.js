
const To = require('../verb')

async function create( payload ){
  try { return await To( 'template/create', 'POST', payload ) }
  catch( error ){ return error }
}

async function get( templateId ){
  try { return await To( 'template/'+ templateId, 'GET' ) }
  catch( error ){ return error }
}

async function list( limit = 20, offset ){
  try { return await To( `template/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
  catch( error ){ return error }
}

async function update( templateId, payload ){
  try { return await To( 'template/update/'+ templateId, 'PUT', payload ) }
  catch( error ){ return error }
}

async function remove( templateId ){
  try { return await To( 'template/delete/'+ templateId, 'DELETE' ) }
  catch( error ){ return error }
}

module.exports = {
  create,
  get,
  list,
  update,
  remove
}