const fs = require('fs')
const zlib = require('zlib')
const { CAS } = require('../dist')

let 
API,
Space,
INVALID_CONFIG = false

describe('[CAS TEST] ------------------------------------------------', function(){
  describe('#Initial Configuration: (/lib/CAS.js)', function(){
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
        API = CAS.config({
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

  describe('#API: (/lib/CAS.js)', function(){
    if( INVALID_CONFIG )
      return console.log('Invalid Configuration')
      
    it('Fetch items from a bucket', async function(){
      try {
        Space = API.Space() 
        console.log( await Space.get('/translations/en.json', 'json') ) 
      }
      catch( error ){ console.error( error.message ) }
    })

    // it('Stream items from CDN', async function(){
    //   try { 
    //     const 
    //     stream = await Space.stream.from('vend-xEBRaYqRTqN/library/medias/e92d3OHvgd3X-1625658742746/original.mp4'),
    //     writefile = fs.createWriteStream('./mediafile.mp4')
        
    //     stream.pipe( writefile )
    //   }
    //   catch( error ){ console.error( error ) }
    // })

    it('Stream items to CDN', async function(){
      try { 
        const upstream = await Space.stream.to('zipstream/file.zip')

        fs.createReadStream('./mediafile.mp4')
          .pipe( zlib.createGzip() ) // Zip video before upload
          .pipe( upstream )
      }
      catch( error ){ console.error( error ) }
    })
  })
})