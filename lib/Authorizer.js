/**---------------------------------------
*          Service API Authorizer
* ----------------------------------------
*  @author: Fabrice Marlboro
*  @description: Access Manager for Sensible APIs portals
*              that required special authorization credentials
*              before to grant access to its APIs
*
*  Copyright 2019, MyappLabs - https://webmicros.com/license
*
*  @param {String} service Type of service being protected by the authorizer
*                        For now only two are supported:
*                        - Database access
*                        - API endpoints access
*
*  @param {String} manifest Absolute url/path to the manifest JSON list
*                            containing all credentials and scopes set
*                            provided by this service. Which 3rd party
*                            service is allowed to access them and how.
*                            Eg. /.../manifest.json
*  @return {Object}
*      - authorization: Middleware function to track censorsed
*                      API requests and verify authorizations
*      - routers: function that expose a set of routers to be
*                allocate to express in order to handle authorization
*                request and management by 3rd party API consumers
*/
const path = require('path')
const { Router } = require('express')
const randtoken = require('rand-token')
const { checkFormSchema } = require('../validator')
const { checkConfig } = require('../utils')

const
CONFIG = {},
HTTP_ERROR_MESSAGES = {
  "400": "Bad Request. Check https://developer.webmicros.com/api/error/HTTP-400",
  "401": "Access Denied. check https://developer.webmicros.com/api/error/HTTP-401",
  "403": "Forbidden Access. check https://developer.webmicros.com/api/error/HTTP-403",
  "412": "Precondition Undefined. check https://developer.webmicros.com/api/error/HTTP-412"
},

askCreds = [
  { type: 'string', name: 'agent' },
  { type: 'object', name: 'scope' },
  { type: [ 'boolean', 'string' ], name: 'instance', optional: true }
],
refreshCreds = [
  { type: 'string', name: 'agent' },
  { type: 'string', name: 'token' },
  { type: 'number', name: 'expiry' }
],
revokeCreds = [
  { type: 'string', name: 'agent' },
  { type: 'string', name: 'token' }
]

function init(){
  const
  ExpiryDelay = Number( CONFIG.expiry ) || 30, // in minute
  // Assign API Authorizations Manifest
  checkAgent = ( req, res, next ) => {

    const [ name, version ] = req.body.agent.split('/')

    // Check credentials
    if( !name || !version
        || !CONFIG.manifest.hasOwnProperty( name )
        || CONFIG.manifest[ name ].version != version )
      return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unknown User-Agent' })

    req.agent = { name, version, manifest: CONFIG.manifest[ name ] }
    next()
  }

  return {
    /* Verify whether authorization access is granted
      to any user-agent making API request: All routes
      on this server are sealed
    */
    authorization: ( req, res, next ) => {
      
      if( CONFIG.allowedOrigins ){
        // Require request origin
        if( !req.headers.origin )
          return res.status(403).send( HTTP_ERROR_MESSAGES['403'] )

        // Check headers
        const origin = req.headers.origin.replace(/http(s?):\/\//, '')
        // regex domain matcher
        if( !( new RegExp( CONFIG.allowedOrigins, 'i' ).test( origin ) ) )
          return res.status(403).send( HTTP_ERROR_MESSAGES['403'] )
      }

      if( !req.headers[ CONFIG.agentHeader ]
          || !req.headers[ CONFIG.tokenHeader ] )
        return res.status(412).send( HTTP_ERROR_MESSAGES['412'] )

      const
      [ name, version ] = req.headers[ CONFIG.agentHeader ].split('/'),
      url = req.url.replace(/\?(.+)$/, ''),
      body = [ 'GET' ].includes( req.method ) ? req.query : req.body

      // Check user-agent
      if( !name || !version
          || !CONFIG.manifest.hasOwnProperty( name )
          || CONFIG.manifest[ name ].version != version )
        return res.status(401).send( HTTP_ERROR_MESSAGES['401'] )

      // Check credentials
      const token = req.headers[ CONFIG.tokenHeader ]
      let
      creds = CONFIG.manifest[ name ].credentials,
      index

      if( Array.isArray( creds ) ){
        for( let o = 0; o < creds.length; o++ ){
          if( creds[o].token == token ){
            index = o
            creds = creds[ index ]
            break
          }
        }

        if( index == undefined )
          return res.status(401).send( HTTP_ERROR_MESSAGES['401'] )
      }

      if( !creds
          || !creds.token
          || creds.token != token
          /* The condition below impose that any user-agent
            that get its credentials including expiry date
            must setup expiry check-up works in other to auto-
            matically renew those credentials before the expire.
            Otherwise, Data-provider will bounce their requests
          */
          || ( CONFIG.rotateToken && creds.expiry && creds.expiry < Date.now() ) )
        return res.status(401).send( HTTP_ERROR_MESSAGES['401'] )

      // console.log( 'body: ', body, url )

      // Check allowed APIs
      // if( !CONFIG.manifest[ name ].scope.endpoints.includes( url ) )
      //   return res.status(400).send( HTTP_ERROR_MESSAGES['400'] )

      // console.log( 'body: ', body )
      // Check allowed datatables for CRUD requests only
      if( CONFIG.service == 'database'
          && !url.includes('/tenant')
          && !url.includes('/authorization') // except authorization API requests
          && ( !body
                || !body.table
                || !CONFIG.manifest[ name ].scope.datatables.includes( body.table ) ) )
        return res.status(400).send( HTTP_ERROR_MESSAGES['400'] )

      next()
    },
    
    /* Autorization request routers  to be register to
      the app's routing system like express
    */
    routers: () => {

      return Router()
      // Grant access credentials to Resources
      .post( '/authorization/request', checkFormSchema( askCreds ), checkAgent, async ( req, res ) => {

          const
          scope = req.body.scope,
          AllowedScopes = req.agent.manifest.scope

          if( // No endpoints scope defined but required
              ( Array.isArray( AllowedScopes.endpoints )
                && AllowedScopes.endpoints.length
                && ( !Array.isArray( scope.endpoints ) || !scope.endpoints.length ) )
              // No table scope defined but required
              || CONFIG.service == 'database'
                  && Array.isArray( AllowedScopes.datatables )
                  && AllowedScopes.datatables.length
                  && ( !Array.isArray( scope.tables ) || !scope.tables.length ) )
            return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Authorization Scope' })

          // Check allowed APIs
          for( let o = 0; o < scope.endpoints.length; o++ )
            if( !AllowedScopes.endpoints.includes( scope.endpoints[o] ) )
              return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unauthorized Scope API' })

          // Check allowed datatables for CRUD requests only
          if( CONFIG.service == 'database' )
            for( let o = 0; o < scope.tables.length; o++ )
              if( !AllowedScopes.datatables.includes( scope.tables[o] ) )
                return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Unauthorized Scope Table' })

          // Grant access
          const thisCreds = {
                              token: randtoken.generate(88),
                              expiry: Date.now() +( ExpiryDelay * 60 * 1000 ) // Expire in an hour
                            }

          /* For multi-instance cluster servers or
              multiple services using the same user-agent
              to get credentials, it's recommanded to specified
              the "instance" attribute for Authorizer to be able
              to create and manage an array of credentials
              granted to each instance.

              Otherwise, credentials granted for each instances
              will overwrite the previous one's rendering the
              previous instance's credentials invalid.
          */
          if( req.body.instance ){
            let credentials = req.agent.manifest.credentials || []

            if( !Array.isArray( credentials ) )
              credentials = [ credentials ]

            credentials.push( thisCreds )
            req.agent.manifest.credentials = credentials
          }
          else req.agent.manifest.credentials = thisCreds

          // console.log( 'updated: ', CONFIG.manifest )
          res.status(201)
              .json({
                      error: false,
                      status: 'AUTHORIZATION::GRANTED',
                      result: Object.assign( { agent: req.body.agent }, thisCreds )
                    })
      })
      // Refresh access credentials to Resources
      .put( '/authorization/refresh', checkFormSchema( refreshCreds ), checkAgent, async ( req, res ) => {

        if( !req.agent.manifest.credentials )
          return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })

        let
        creds = req.agent.manifest.credentials,
        index

        const
        token = req.body.token,
        isArrayCreds = Array.isArray( creds )

        if( isArrayCreds ){
          for( let o = 0; o < creds.length; o++ ){
            if( creds[o].token == token ){
              index = o
              creds = creds[ index ]
              break
            }
          }

          if( index == undefined )
            return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })
        }

        if( !creds.token
            || !creds.expiry
            || token != creds.token )
          return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Credentials' })

        // Generate new credentials
        const thisCreds = {
                            token: randtoken.generate(88),
                            expiry: Date.now() +( ExpiryDelay * 60 * 1000 ) // Expire in an hour
                          }

        isArrayCreds ?
              req.agent.manifest.credentials[ index ] = thisCreds
              : req.agent.manifest.credentials = thisCreds

        // console.log( 'updated: ', CONFIG.manifest )
        res.json({
                  error: false,
                  status: 'AUTHORIZATION::REFRESHED',
                  result: Object.assign( { agent: req.body.agent }, thisCreds )
                })
      })
      // Revoke access credentials to Resources
      .delete( '/authorization/revoke', checkFormSchema( revokeCreds ), checkAgent, async ( req, res ) => {

        if( !req.agent.manifest.credentials )
          return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })

        let
        creds = req.agent.manifest.credentials,
        index

        const
        token = req.body.token,
        isArrayCreds = Array.isArray( creds )

        if( isArrayCreds ){
          for( let o = 0; o < creds.length; o++ ){
            if( creds[o].token == token ){
              index = o
              creds = creds[ index ]
              break
            }
          }

          if( index == undefined )
            return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Undefined Credentials' })
        }

        if( !creds.token
            || !creds.expiry
            || token != creds.token )
          return res.json({ error: true, status: 'AUTHORIZATION::DENIED', message: 'Invalid Credentials' })

        // Generate new credentials
        isArrayCreds ?
            req.agent.manifest.credentials.splice( index, 1 )
            : delete req.agent.manifest.credentials

        // console.log( 'updated: ', CONFIG.manifest )
        res.json({
                  error: false,
                  status: 'AUTHORIZATION::REVOKED',
                  result: { agent: req.body.agent }
                })
      })
    }
  }
}

module.exports = options => {
  
  if( typeof options != 'object' )
    throw new Error('[Authorizer]: Undefined Configuration')

  // Check whether all configuration field are defined
  Object.assign( CONFIG, options )
  checkConfig( 'Authorizer', CONFIG )

  return init()
}
