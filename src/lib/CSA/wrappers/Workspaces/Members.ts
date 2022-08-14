
export default ( to: any ) => {
  return ( wid: string ) => {
    const trunc = `workspaces/${wid}/members`

    async function add( payload: any ){
      try { return await to( `${trunc}/add`, 'POST', payload ) }
      catch( error ){ return error }
    }
    
    async function list( limit: number = 20, offset?: number ){
      try { return await to( `${trunc}?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function get( mid: string ){
      try { return await to( `${trunc}/${mid}`, 'GET' ) }
      catch( error ){ return error }
    }
    
    async function update( mid: string, payload: any ){
      try { return await to( `${trunc}/${mid}`, 'PATCH', payload ) }
      catch( error ){ return error }
    }
    
    async function remove( mid: string, reasons = {} ){
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