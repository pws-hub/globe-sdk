
const { BND } = require('../index')

let 
TRANSPORT_ID = '2FE-2E4E-8BCF', // Dummy transportId
TEMPLATE_ID = '3FE-3E4E-9BCF', // Dummy templateId
REGISTRY_ID = '4FE-4E4E-0BCF', // Dummy registryId
api

const
TRANSPORT_ATTRIBUTE = 'App-Email-Sender',
TEMPLATE_NAME = 'Phone Number Verification Code',
REGISTRY_NAME = 'Newsletter Registry'

const
addTransport = async function(){
  const 
  payload = {
    attribute: TRANSPORT_ATTRIBUTE,
    host: 'smtp.googlemail.com',
    port: 465,
    security: 'tls',
    username: 'no-reply@multipple.com',
    password: 'yddnqdzfafdfutks'
  },
  { error, status, message, transportId } = await BND.transport.add( payload )
  
  transportId ?
      TRANSPORT_ID = transportId
      : console.error({ error, status, message })
},
createTemplate = async function(){
  const 
  payload = {
    name: TEMPLATE_NAME,
    description: "Globe: Send a verification code to user's phone number.",
    html: "<html><body><p><strong>{{vCode}}</strong> is your 6-digit verification code. Do not share it with 3rd party.</p><a href='{{refURL}}'>Check reference</a></body></html>",
    text: "{{vCode}} is your 6-digit verification code. Do not share it with 3rd party. {{refURL}}",
    scope: [ "vCode", 'refURL' ]
  },
  { error, status, message, templateId } = await api.template.create( payload )
  
  templateId ?
      TEMPLATE_ID = templateId
      : console.error({ error, status, message })
},
createRegistry = async function(){
  const 
  payload = {
    type: 'email',
    name: REGISTRY_NAME,
    description: 'Multiple 2.0 newsletter registry list',
    list: [ 'aurphal2012@gmail.com' ]
  },
  { error, status, message, registryId } = await api.registry.create( payload )
  
  registryId ?
      REGISTRY_ID = registryId
      : console.error({ error, status, message })
}

describe('[BND TEST] ------------------------------------------------', function(){
  describe('# Initial Configuration: (/lib/BND/index.js)', function(){
    it('Should throw "No configuratin defined" Error', function(){
      try { api = BND() }
      catch( error ){ console.log( error.message ) }
    })

    it('Should throw Incompleted Configuration Error', function(){
      try { api = BND({ server: 'https://example.com' }) }
      catch( error ){ console.log( error.message ) }
    })

    it('Valid Configuration', function(){
      try { 
        api = BND({
                    server: 'http://bnd.micros.io:10001/v1',
                    userAgent: 'MP.LMS/1.0',
                    application: 'Multipple',
                    host: 'hello.multipple.com',
                    accessToken: 'yNRzicj9GVNxZK2N5aSpkQr6NjNDOpdoU07DddWOeE9nPRXKzP3gR2M0ZDlkOTc1NjQyN2M1NGUjZTg5OTI4MzY3ND'
                  }) }
      catch( error ){ console.log( error ) }
    })

    it('Overwrite Existing Configuration', function(){
      try { api.setConfig({ host: 'gretting.multipple.com' }) }
      catch( error ){ console.log( error ) }
    })
  })
  
  describe('## Transport: (/lib/BND/wrappers/Transport.js)', function(){
    describe('# BND.transport.add(...)', function(){ 
      it('Shoud return JSON response with "transportId"', addTransport ) 
    })
    
    describe('# BND.transport.get(...)', function(){
      it('Shoud return JSON response with "transport"', async function(){
        const { error, message, transport } = await api.transport.get( TRANSPORT_ID )
        if( error ) throw new Error( message )

        console.log('Transport: ', transport )
      })
    })
    
    describe('# BND.transport.list(...)', function(){
      it('Shoud return JSON response with "results" as array', async function(){
        const { error, message, transports } = await api.transport.list()
        if( error ) throw new Error( message )

        console.log('Transports: ', transports )
      })
    })
    
    describe('# BND.transport.update(...)', function(){
      it('Shoud return JSON response with "transport" as object of updates', async function(){
        const 
        payload = {
          attribute: 'Support-Email-Sender',
          username: 'support@multipple.com'
        },
        { error, message, transport } = await api.transport.update( TRANSPORT_ID, payload )
        if( error ) throw new Error( message )

        console.log('Transport: ', transport )
      })
    })
    
    describe('# BND.transport.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Transport Deleted"', async function(){
        const { error, status, message } = await api.transport.remove( TRANSPORT_ID )
        console.log({ error, status, message })
      })
    })
  })
  
  describe('## Template: (/lib/BND/wrappers/Template.js)', function(){
    describe('# BND.template.create(...)', function(){
      it('Shoud return JSON response with "templateId"', createTemplate )
    })
    
    describe('# BND.template.get(...)', function(){
      it('Shoud return JSON response with "template"', async function(){
        const { error, message, template } = await api.template.get( TEMPLATE_ID )
        if( error ) throw new Error( message )

        console.log('Template: ', template )
      })
    })
    
    describe('# BND.template.list(...)', function(){
      it('Shoud return JSON response with "results" as array', async function(){
        const { error, message, templates } = await api.template.list()
        if( error ) throw new Error( message )

        console.log('Templates: ', templates )
      })
    })
    
    describe('# BND.template.update(...)', function(){
      it('Shoud return JSON response with "template" as object of updates', async function(){
        const 
        payload = {
          html: "<html><body><p><strong>{{vCode}}</strong> is your VendOne 6-digit verification code. Do not share it with 3rd party.</p><a href='{{refURL}}'>Check reference</a><br><br><em>{{domain}}</em></body></html>",
          scope: [ "vCode", "refURL", "domain" ]
        },
        { error, message, template } = await api.template.update( TEMPLATE_ID, payload )
        if( error ) throw new Error( message )

        console.log('Template: ', template )
      })
    })
    
    describe('# BND.template.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Template Deleted"', async function(){
        const { error, status, message } = await api.template.remove( TEMPLATE_ID )
        console.log({ error, status, message })
      })
    })
  })

  describe('## Registry: (/lib/BND/wrappers/Registry.js)', function(){
    describe('# BND.registry.create(...)', function(){
      it('Shoud return JSON response with "registryId"', createRegistry )
    })
    
    describe('# BND.registry.get(...)', function(){
      it('Shoud return JSON response with "registry"', async function(){
        const { error, message, registry } = await api.registry.get( REGISTRY_ID )
        if( error ) throw new Error( message )

        console.log('Registry: ', registry )
      })
    })
    
    describe('# BND.registry.list(...)', function(){
      it('Shoud return JSON response with "results" as array', async function(){
        const { error, message, registries } = await api.registry.list()
        if( error ) throw new Error( message )

        console.log('Registries: ', registries )
      })
    })
    
    describe('# BND.registry.update(...)', function(){
      it('Shoud return JSON response with "registry" as object of updates', async function(){
        const 
        payload = {
          name: 'Daily Articles Emails',
          list: [ 'xyz@example.com', 'abc@example.com' ]
        },
        { error, message, registry } = await api.registry.update( REGISTRY_ID, payload )
        if( error ) throw new Error( message )

        console.log('Registry: ', registry )
      })
    })
    
    describe('# BND.registry.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Registry Deleted"', async function(){
        const { error, status, message } = await api.registry.remove( REGISTRY_ID )
        console.log({ error, status, message })
      })
    })
  })

  describe('## Sender: (/lib/BND/wrappers/Sender.js)', function(){
    
    describe('# Add/Create requirements before to send Email or SMS', function(){
      it('Add Transport: Should assign `transportId` to TRANSPORT_ID variable', addTransport )
      it('Add Template: Should assign `templateId` to TEMPLATE_ID variable', createTemplate )
      // it('Add Registry: Should assign `registryId` to REGISTRY_ID variable', createRegistry )
    })

    // describe('# BND.send.email(...)', function(){
    //   it('Should return Email to "<...>" is sent', async function(){
    //     const 
    //     payload = {
    //       express: true,
    //       sender: TRANSPORT_ATTRIBUTE,
    //       template: TEMPLATE_NAME,
    //       subject: 'Email Address Verification Code',
    //       priority: 'high',
    //       // Send to single recipient
    //       recipient: {
    //         address: 'aurphal2012@gmail.com',
    //         name: 'John Marley'
    //       },
    //       // Send to contacts in a the created registry
    //       // recipient: REGISTRY_NAME,
    //       scope: {
    //         name: 'Jonas',
    //         institution: 'Hello School',
    //         vCode: 5999
    //       },
    //       retry: {
    //         xtime: 2,
    //         delay: 30
    //       }
    //     },
    //     { error, status, message } = await BND.send.email( payload )
    //     if( error ) throw new Error( message )
        
    //     console.log({ error, status, message })
    //   })
    // })

    describe('# BND.send.SMS(...)', function(){
      it('Should return SMS to "<...>" is sent', async function(){
        const 
        payload = {
          express: true,
          sender: TRANSPORT_ATTRIBUTE,
          template: TEMPLATE_NAME,
          priority: 'high',
          recipient: '(+228)90494343',
          scope: {
            vCode: 5999,
            refURL: 'https://support.vend.one/pvc-verify',
            domain: 'tenant.vend.one'
          },
          retry: {
            xtime: 2,
            delay: 30
          }
        },
        { error, status, message } = await api.send.SMS( payload )
        if( error ) throw new Error( message )
        
        console.log({ error, status, message })
      })
    })
  })
})