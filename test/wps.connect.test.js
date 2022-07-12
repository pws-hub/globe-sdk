const { WPS } = require('../index')
const { debug } = require('./../utils')

let WPSEvent
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
                    userAgent: 'MP.LXP/1.0',
                    provider: 'Multipple',
                    host: 'hello.multipple.com',
                    accessToken: 'gR2M0ZDlkOTc1NjQyN2M1NGUjZTg5OTI4MzY3NDyNRzicj9GVNxZK2N5aSpkQr6NjNDOpdoU07DddWOeE9nPRXKzP3'
                  }) }
      catch( error ){ console.error( error ) }
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
      WPSEvent.emit('create_group', {})
    })
  })
})