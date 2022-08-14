
export default ( wid: string, to: any ) => {
  return ( pid: string ) => {
    const trunc = `workspaces/${wid}/projects/${pid}/activities`

    async function record( payload: any ){
      try { return await to( `${trunc}/record`, 'POST', payload ) }
      catch( error ){ return error }
    }
    
    async function list( limit: number = 20, offset: number ){
      try { return await to( `${trunc}?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function get( aid: string ){
      try { return await to( `${trunc}/${aid}`, 'GET' ) }
      catch( error ){ return error }
    }
    
    async function remove( aid: string, reasons = {} ){
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