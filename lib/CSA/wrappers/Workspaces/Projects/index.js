
const team = require('./Team')
const activities = require('./Activities')

module.exports = to => {
  return wid => {
    const trunc = `workspaces/${wid}/projects`

    async function create( payload ){
      try { return await to( `${trunc}/create`, 'POST', payload ) }
      catch( error ){ return error }
    }

    async function get( pid ){
      try { return await to( `${trunc}/${pid}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function list( limit = 20, offset ){
      try { return await to( `${trunc}?limit=${limit}${offset ? '&offset='+ offset : ''}`, 'GET' ) }
      catch( error ){ return error }
    }

    async function update( pid, payload ){
      try { return await to( `${trunc}/${pid}`, 'PATCH', payload ) }
      catch( error ){ return error }
    }

    async function link( pid ){
      try { return await to( `${trunc}/${pid}/link`, 'GET' ) }
      catch( error ){ return error }
    }

    async function share( pid, payload ){
      try { return await to( `${trunc}/${pid}/share`, 'PATCH', payload ) }
      catch( error ){ return error }
    }

    async function unshare( pid, payload ){
      try { return await to( `${trunc}/${pid}/unshare`, 'PATCH', payload ) }
      catch( error ){ return error }
    }

    async function remove( pid, reasons = {} ){
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