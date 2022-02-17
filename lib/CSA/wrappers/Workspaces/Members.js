
module.exports = to => {
  return wid => {
    const trunc = `workspaces/${wid}/members`

    async function add( payload ){
      try { return await to( `${trunc}/add`, 'POST', payload ) }
      catch( error ){ return error }
    }
    
    async function list( limit = 20, offset ){
      try { return await to( `${trunc}?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function get( mid ){
      try { return await to( `${trunc}/${mid}`, 'GET' ) }
      catch( error ){ return error }
    }
    
    async function update( mid, payload ){
      try { return await to( `${trunc}/${mid}`, 'PATCH', payload ) }
      catch( error ){ return error }
    }
    
    async function remove( mid, reasons = {} ){
      try { return await to( `${trunc}/${mid}`, 'DELETE', reasons ) }
      catch( error ){ return error }
    }
    
    async function leave( reasons = {} ){
      try { return await to( `${trunc}/leave`, 'DELETE', reasons ) }
      catch( error ){ return error }
    }

    return { add, list, get, update, remove, leave }
  }
}