
const { WPS } = require('../index')

let APP_ID = '2FE-2E4E-8BCF' // Dummy appId

describe('[WPS API TEST] ------------------------------------------------', function(){
  describe('#Initial Configuration: (/lib/WPS/index.js)', function(){
    it('Should throw "No configuratin defined" Error', function(){
      try { WPS.config() }
      catch( error ){ console.log( error.message ) }
    })

    it('Should throw Incompleted Configuration Error', function(){
      try { WPS.config({ server: 'https://example.com' }) }
      catch( error ){ console.log( error.message ) }
    })

    it('Valid Configuration', function(){
      try { 
        WPS.config({ 
                    server: 'http://wps.micros.io:10003',
                    userAgent: 'MP.LMS/1.0',
                    provider: 'Multipple',
                    host: 'hello.multipple.com',
                    accessToken: 'gR2M0ZDlkOTc1NjQyN2M1NGUjZTg5OTI4MzY3NDyNRzicj9GVNxZK2N5aSpkQr6NjNDOpdoU07DddWOeE9nPRXKzP3'
                  }) }
      catch( error ){ console.log( error ) }
    })
  })
  
  describe('#API Wrapper: (/lib/WPS/APIWrapper.js)', function(){
    describe('#createApp()', function(){
      it('Shoud return JSON response with "appId"', async function(){
        const 
        payload = {
          name: 'MyWebhookApp',
          tenant: {
            id: 'hello-x4qMZVSb68n',
            origin: '{{MP_TenantOrigin}}'
          },
          requestURL: 'http://plugin.multipple.com:4009/some/pathname',
          eventTypes: [
            'meeting_created',
            'meeting_end'
          ]
        },
        { error, status, message, appId } = await WPS.api.createApp( payload )
        
        appId ?
            APP_ID = appId
            : console.log({ error, status, message })
      })
    })

    describe('#getApp()', function(){
      it('Shoud return JSON response with "application"', async function(){
        const { error, message, application } = await WPS.api.getApp( APP_ID )
        if( error ) throw new Error( message )

        console.log('Application: ', application )
      })
    })

    describe('#getApps()', function(){
      it('Shoud return JSON response with "results" as array', async function(){
        const { error, message, results } = await WPS.api.getApps()
        if( error ) throw new Error( message )

        console.log('Results: ', results )
      })
    })

    describe('#updateApp()', function(){
      it('Shoud return JSON response with "application" as object of updates', async function(){
        const 
        payload = {
          mode: 'live',
          requestURL: "http://meeting.multipple.com/webhook_call"
        },
        { error, message, application } = await WPS.api.updateApp( APP_ID, payload )
        if( error ) throw new Error( message )

        console.log('Application: ', application )
      })
    })

    describe.skip('#deleteApp()', function(){
      it('Shoud return JSON response with "message" as "Application Deleted"', async function(){
        const { error, status, message } = await WPS.api.deleteApp( APP_ID )
        console.log({ error, status, message })
      })
    })

    describe('#getIncomingRequestURL()', function(){
      it('Shoud return JSON response with "result" as URL', async function(){
        const { error, message, result } = await WPS.api.getIncomingRequestURL( APP_ID )
        if( error ) throw new Error( message )

        console.log('URL: ', result )
      })
    })

    describe('#getIncomingRequestToken()', function(){
      it('Shoud return JSON response with "result" as URL', async function(){
        const { error, message, result } = await WPS.api.getIncomingRequestToken( APP_ID )
        if( error ) throw new Error( message )

        console.log('Incoming Token: ', result )
      })
    })

    describe('#getOutgoingRequestToken()', function(){
      it('Shoud return JSON response with "result" as Outgoing Token', async function(){
        const { error, message, result } = await WPS.api.getOutgoingRequestToken( APP_ID )
        if( error ) throw new Error( message )

        console.log('Outgoing Token: ', result )
      })
    })
  })
})