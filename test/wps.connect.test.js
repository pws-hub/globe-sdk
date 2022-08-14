
const { WPS } = require('../dist')
const { debug } = require('../dist/utils')

let 
WPSEvent,
APP_ID

describe('[WPS CONNECT TEST] ------------------------------------------------', function(){
  describe('#Initial Configuration: (/lib/WPS/index.js)', function(){
    it('Should throw "No configuratin defined" Error', function(){
      try { WPS.config() }
      catch( error ){ console.error( error.message ) }
    })

    it('Should throw Incompleted Configuration Error', function(){
      try { WPS.config({ server: 'https://example.com' }) }
      catch( error ){ console.error( error.message ) }
    })
    
    it('Valid Configuration', function(){
      try { 
        WPS.config({
                    server: 'http://wps.micros.io:10003',
                    userAgent: 'Bloum/1.0',
                    provider: 'Bloum',
                    host: 'api.bloum.io',
                    accessToken: 'NjgRaDU0eTI4MpkQUjZTNRziVzYSN2QkOTc11NgDl5yNrcj9G6NjN3ND3PRX7DdyG2MM0ZOZK2N5xEOKzdWOpdo9nP'
                  }) }
      catch( error ){ console.error( error ) }
    })
  })

  describe('#API Wrapper: (/lib/WPS/APIWrapper.js)', function(){
    describe('#createApp()', function(){
      it('Shoud return JSON response with "appId"', async function(){
        const 
        payload = {
          name: 'Bloum',
          tenant: {
            id: 'bloum-x4qMZVSb68n',
            origin: 'api.bloum.io'
          },
          requestURL: 'http://api.bloum.io:28600/webhook',
          eventList: ['shared']
        },
        { error, status, message, appId } = await WPS.api.createApp( payload )
        
        appId ?
            APP_ID = appId
            : console.error({ error, status, message })
      })
    })

    describe('#getApp()', function(){
      it('Shoud return JSON response with "application"', async function(){
        const { error, message, application } = await WPS.api.getApp( APP_ID )
        if( error ) throw new Error( message )

        debug('Application: ', application )
      })
    })
  })
    
  describe('#Provider Connect: (/lib/WPS/Connect.js)', function(){
    it.skip('Should throw "No configuratin Found" Error', async function(){
      try { await WPS.connect() }
      catch( error ){ console.error( error.message ) }
    })
    
    it('Connected Successfully', async function(){
      try { WPSEvent = await WPS.connect() }
      catch( error ){ console.error( error.message ) }
    })
  })

  describe('#Provider Events: (/lib/WPS/Connect.js)', function(){
    it('Emit event Successfully', function(){
      WPSEvent.emit('group.created', 'serviceuniqtoken', {})
    })
  })
})