
const To = require('../verb')

async function add( payload ){
  try { return await To( 'email/transport/add', 'POST', payload ) }
  catch( error ){ return error }
}

async function get( transportId ){
  try { return await To( 'email/transport/'+ transportId, 'GET' ) }
  catch( error ){ return error }
}

async function list( limit = 20, offset ){
  try { return await To( `email/transport/list?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
  catch( error ){ return error }
}

async function update( transportId, payload ){
  try { return await To( 'email/transport/update/'+ transportId, 'PUT', payload ) }
  catch( error ){ return error }
}

async function remove( transportId ){
  try { return await To( 'email/transport/delete/'+ transportId, 'DELETE' ) }
  catch( error ){ return error }
}

module.exports = {
  add,
  get,
  list,
  update,
  remove
}