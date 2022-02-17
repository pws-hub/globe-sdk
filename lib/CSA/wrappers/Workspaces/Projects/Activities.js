
module.exports = ( wid, to) => {
  return pid => {
    const trunc = `workspaces/${wid}/projects/${pid}/activities`

    async function record( payload ){
      try { return await to( `${trunc}/record`, 'POST', payload ) }
      catch( error ){ return error }
    }
    
    async function list( limit = 20, offset ){
      try { return await to( `${trunc}?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function get( aid ){
      try { return await to( `${trunc}/${aid}`, 'GET' ) }
      catch( error ){ return error }
    }
    
    async function remove( aid, reasons = {} ){
      try { return await to( `${trunc}/${aid}`, 'DELETE', reasons ) }
      catch( error ){ return error }
    }
    
    async function clear( reasons = {} ){
      try { return await to( `${trunc}/clear`, 'DELETE', reasons ) }
      catch( error ){ return error }
    }

    return { record, list, get, remove, clear }
  }
}