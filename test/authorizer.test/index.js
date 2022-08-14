
const { Authorizer } = require('../../dist')
const { debug } = require('../../dist/utils')

let api

describe('[Authorizer TEST] ------------------------------------------------', function(){
  describe('# Initial Configuration: (/lib/Authorizer.js)', function(){
    it('Should throw "No configuratin defined" Error', function(){
      try { Authorizer() }
      catch( error ){ debug( error.message ) }
    })

    it('Should throw Incompleted Configuration Error', function(){
      try { Authorizer({ service: 'database' }) }
      catch( error ){ debug( error.message ) }
    })

    it('Valid Configuration', function(){
      try {
        api = Authorizer({
                          service: 'database',
                          manifest: require('./manifest.json'),
                          agentHeader: 'x-user-agent',
                          tokenHeader: 'x-access-token',
                          allowedOrigins: '(\.?)(vend|multipple)\.(one|com)',
                          rotateToken: true,
                          expiry: 90 // 90 seconds
                        })

        debug('API: ', api )
      }
      catch( error ){ debug( error ) }
    })
  })
})