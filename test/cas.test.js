
const { CAS } = require('../index')

let INVALID_CONFIG = false

describe('[CAS TEST] ------------------------------------------------', function(){
  describe('#Initial Configuration: (/lib/CAS/index.js)', function(){
    it('Should throw "No configuratin defined" Error', function(){
      try { CAS.config() }
      catch( error ){
        INVALID_CONFIG = true
        console.error( error.message ) 
      }
    })

    it('Should throw Incompleted Configuration Error', function(){
      try { CAS.config({ accessKey: '0h0h023h028h3h0238' }) }
      catch( error ){ 
        INVALID_CONFIG = true
        console.error( error.message ) 
      }
    })

    it('Valid Configuration', function(){
      try {
        CAS.config({
                    accessKey: '6S7Z2PMY6PDB5L6BFHYI',
                    secret: '5ynr9I/kWbEnW1fWfgIjRi1b9YeEVpM7J8Rpiga76oY',
                    spaces: [
                      {
                        region: 'fra1',
                        endpoint: 'fra1.digitaloceanspaces.com',
                        version: 'latest',
                        bucket: 'multipple20',
                        host: 'https://multipple20.fra1.digitaloceanspaces.com'
                      }
                    ],
                    defaultRegion: 'fra1',
                    compressKey: 'DmghtKXJXxL6lYqJgCGnL1dXGgDJ6m6L'
                  })
      }
      catch( error ){
        INVALID_CONFIG = true
        console.error( error ) 
      }
    })
  })

  describe('#Provider Connect: (/lib/CAS/Connect.js)', function(){
    // it.skip('Should throw "No configuratin Found" Error', function(){
    //   try { CAS.connect() }
    //   catch( error ){ console.error( error.message ) }
    // })

    let API
    if( INVALID_CONFIG )
      return console.log('Invalid Configuration')
    
    it('Connected Successfully', function(){
      try { API = CAS.connect() }
      catch( error ){ console.error( error.message ) }
    })

    it('Should throw "CAS is already connected" Error', function(){
      try { CAS.connect() }
      catch( error ){ console.error( error.message ) }
    })

    it('Fetch items from a bucket', async function(){
      try { console.log( await API.Space().get('/translations/en.json', 'json') ) }
      catch( error ){ console.error( error.message ) }
    })
  })
})