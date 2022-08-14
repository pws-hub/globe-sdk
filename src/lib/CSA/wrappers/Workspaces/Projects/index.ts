
import team from './Team'
import activities from './Activities'

export default ( to: any ) => {
  return ( wid: string ) => {
    const trunc = `workspaces/${wid}/projects`

    async function create( payload: any ){
      try { return await to( `${trunc}/create`, 'POST', payload ) }
      catch( error ){ return error }
    }

    async function get( pid: string ){
      try { return await to( `${trunc}/${pid}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function list( limit: number = 20, offset?: number ){
      try { return await to( `${trunc}?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function update( pid: string, payload: any ){
      try { return await to(`${trunc}/${pid}`, 'PATCH', payload ) }
      catch( error ){ return error }
    }

    async function link( pid: string ){
      try { return await to(`${trunc}/${pid}/link`, 'GET' ) }
      catch( error ){ return error }
    }

    async function share( pid: string, payload: any ){
      try { return await to( `${trunc}/${pid}/share`, 'PATCH', payload ) }
      catch( error ){ return error }
    }

    async function unshare( pid: string, payload: any ){
      try { return await to( `${trunc}/${pid}/unshare`, 'PATCH', payload ) }
      catch( error ){ return error }
    }

    async function remove( pid: string, reasons = {} ){
      try { return await to( `${trunc}/${pid}`, 'DELETE', reasons ) }
      catch( error ){ return error }
    }
    
    return {
      create,
      get,
      list,
      update,
      link,
      share,
      unshare,
      remove,
      team: team( wid, to ),
      activities: activities( wid, to )
    }
  }
}