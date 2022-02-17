
const { CSA } = require('../index')
const { debug } = require('./../utils')

let 
WORKSPACE_ID = '143-93148c-f011', // Dummy workspaceId
MEMBER_ID = '712340123412348ny123p90h0hy4b234dk129pu34h1293', // Additional memberId
PROJECT_ID = '143-93148c-f011', // Dummy projectId
ACTIVITY_ID = '143-93148c-f011', // Dummy activityId

api,
Members,
Projects,
Team,
Activities

const
createWorkspace = async function(){
  const 
  payload = {
    "personal": false,
    "name" : "PWS Dev",
    "description" : "Workspace for developing Multipple Application.",
    "logo" : "https://cdn.dribbble.com/users/400493/screenshots/2703191/hello_still_2x.gif?compress=1&resize=300x300",
    "domain": "pws.multipple.com",
    "members": [
      {
          "id": "dkp90h0h129pu34h12934y712340123412348ny123y4b234",
          "name": "Ebrow Gezou",
          "photo": false,
          "role": "OWNER",
          "active": true
      }
    ]
  },
  response = await api.workspaces.create( payload )

  debug( response )
  const { error, status, message, workspaceId } = response
  
  if( !workspaceId )
    return console.error({ error, status, message })
  
  WORKSPACE_ID = workspaceId
  Members = api.workspaces.members( workspaceId )
  Projects = api.workspaces.projects( workspaceId )
},
createProject = async function(){
  const 
  payload = {
    "personal": false,
    "type": "application",
    "name" : "Evaluation Pro",
    "description" : "Assignment and assessment creation tools.",
    "icon" : "https://cdn.dribbble.com/users/400493/screenshots/2703191/hello_still_2x.gif?compress=1&resize=300x300",
    "members": [
        {
            "id": "dkp90h0h129pu34h12934y712340123412348ny123y4b234",
            "name": "Ebrow Gezou",
            "photo": false,
            "role": "OWNER",
            "active": true
        }
    ],
    "specs": {
        "code": {
            "language": "react~8.5",
            "platforms": ["pws-os"],
            "directory": "/path/to/project",
            "repository": "https://github/multipple/evaluation-pro.git"
        },
        "API": [],
        "sockets": [],
        "units": []
    }
  },
  { error, status, message, projectId } = await Projects.create( payload )
  
  if( !projectId )
    return console.error({ error, status, message })
  
  PROJECT_ID = projectId
  Team = Projects.team( projectId )
  Activities = Projects.activities( projectId )
}

describe('[CSA TEST] ------------------------------------------------', function(){
  describe('## Initial Configuration: (/lib/CSA/index.js)', function(){
    it('Should throw "No configuratin defined" Error', function(){
      try { api = CSA.config() }
      catch( error ){ debug( error.message ) }
    })

    it('Should throw Incompleted Configuration Error', function(){
      try { api = CSA.config({ baseURL: 'https://example.com' }) }
      catch( error ){ debug( error.message ) }
    })

    it('Valid Configuration', function(){
      try { 
        api = CSA.config({
                          baseURL: 'http://api.cubic.studio:7777/v1',
                          accessToken: 'dkp90h0h129pu34h12934y712340123412348ny123y4b234'
                        }) 
      }
      catch( error ){ debug( error ) }
    })

    // it('Overwrite Existing Configuration', function(){
    //   try { api.setConfig({ accessToken: 'dkp90h0h129pu34h12934y712340123412348ny123y4b234' }) }
    //   catch( error ){ debug( error ) }
    // })
  })
  
  describe('## Workspaces: (/lib/CSA/wrappers/Workspaces/index.js)', function(){
    describe('# CSA.workspaces.create(...)', function(){ 
      it('Shoud return JSON response with "workspaceId"', createWorkspace ) 
    })
    
    describe('# CSA.workspaces.get(...)', function(){
      it('Shoud return JSON response with "workspace"', async function(){
        const { error, message, workspace } = await api.workspaces.get( WORKSPACE_ID )
        if( error ) throw new Error( message )

        debug('Workspace: ', workspace )
      })
    })
    
    describe('# CSA.workspaces.list(...)', function(){
      it('Shoud return JSON response with "workspaces" field as array', async function(){
        const { error, message, workspaces, more } = await api.workspaces.list()
        if( error ) throw new Error( message )

        debug('Workspaces: ', workspaces, more )
      })
    })
    
    describe('# CSA.workspaces.update(...)', function(){
      it('Shoud return JSON response with "workspace" field as object of updates', async function(){
        const 
        payload = {
          name: 'PWS Dev',
          domain: 'dev.pws-os.com'
        },
        { error, message, workspace } = await api.workspaces.update( WORKSPACE_ID, payload )
        if( error ) throw new Error( message )

        debug('Workspace: ', workspace )
      })
    })
    
    // describe('# CSA.workspaces.remove(...)', function(){
    //   it('Shoud return JSON response with "message" as "Workspace Deleted"', async function(){
    //     const { error, status, message } = await api.workspaces.remove( WORKSPACE_ID )
    //     debug({ error, status, message })
    //   })
    // })
  })
  
  describe('## Workspace Members: (/lib/CSA/wrappers/Workspaces/Members.js)', function(){
    describe('# CSA.workspaces:members.add(...)', function(){
      it('Shoud return JSON response with a message "Member Added"', async function(){
        const 
        payload = [
          {
              "id": MEMBER_ID,
              "name": "Meani Pelissa",
              "photo": false,
              "role": "DEVELOPER"
          }
        ],
        { error, status, message } = await Members.add( payload )
        
        error && console.error({ error, status, message })
      })
    })
    
    describe('# CSA.workspaces:members.get(...)', function(){
      it('Shoud return JSON response with "member"', async function(){
        const { error, message, member } = await Members.get( MEMBER_ID )
        if( error ) throw new Error( message )

        debug('Member: ', member )
      })
    })
    
    describe('# CSA.workspaces:members.list(...)', function(){
      it('Shoud return JSON response with "members" field as array', async function(){
        const { error, message, members } = await Members.list()
        if( error ) throw new Error( message )

        debug('Members: ', members )
      })
    })
    
    describe('# CSA.workspaces:members.update(...)', function(){
      it('Shoud return JSON response with "member" field as object of updates', async function(){
        const 
        payload = {
          role: 'MAINTAINER'
        },
        { error, message, member } = await Members.update( MEMBER_ID, payload )
        if( error ) throw new Error( message )

        debug('Member: ', member )
      })
    })
    
    describe('# CSA.workspaces:members.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Member Removed"', async function(){
        const { error, status, message } = await Members.remove( MEMBER_ID )
        debug({ error, status, message })
      })
    })
    
    /*
    describe('# CSA.workspaces:members.leave(...)', function(){
      it('Shoud return JSON response with "message" as "Member Left"', async function(){
        const { error, status, message } = await Members.leave()
        debug({ error, status, message })
      })
    })
    */
  })

  describe('## Project: (/lib/CSA/wrappers/Workspaces/Projects/index.js)', function(){
    describe('# CSA.workspaces:projects.create(...)', function(){
      it('Shoud return JSON response with "projectId"', createProject )
    })
    
    describe('# CSA.workspaces:projects.get(...)', function(){
      it('Shoud return JSON response with "project"', async function(){
        const { error, message, project } = await Projects.get( PROJECT_ID )
        if( error ) throw new Error( message )

        debug('Project: ', project )
      })
    })
    
    describe('# CSA.workspaces:projects.list(...)', function(){
      it('Shoud return JSON response with "projects" field as array', async function(){
        const { error, message, projects } = await Projects.list()
        if( error ) throw new Error( message )

        debug('Projects: ', projects )
      })
    })
    
    describe('# CSA.workspaces:projects.update(...)', function(){
      it('Shoud return JSON response with "project" field as object of updates', async function(){
        const 
        payload = {
          type: 'plugin',
          name: 'assetLib',
          'scope.code.directory': '/users/username/projectname'
        },
        { error, message, project } = await Projects.update( PROJECT_ID, payload )
        if( error ) throw new Error( message )

        debug('Project: ', project )
      })
    })

    /*
    describe('# CSA.workspaces:projects.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Project Deleted"', async function(){
        const { error, status, message } = await Projects.remove( PROJECT_ID )
        debug({ error, status, message })
      })
    })
    */
  })
  
  describe('## Project Team: (/lib/CSA/wrappers/Workspaces/Projects/Team.js)', function(){
    describe('# CSA.workspaces:projects:team.add(...)', function(){
      it('Shoud return JSON response with message "Member Added"', async function(){
        const
        payload = [
          {
              "id": MEMBER_ID,
              "name": "Bernis Akufo",
              "photo": false,
              "role": "DEVELOPER"
          }
        ],
        { error, status, message } = await Team.add( payload )
        
        error && console.error({ error, status, message })
      })
    })
    
    describe('# CSA.workspaces:projects:team.get(...)', function(){
      it('Shoud return JSON response with "member"', async function(){
        const { error, message, member } = await Team.member( MEMBER_ID )
        if( error ) throw new Error( message )

        debug('Member: ', member )
      })
    })
    
    describe('# CSA.workspaces:projects:team.list(...)', function(){
      it('Shoud return JSON response with "members" field as array', async function(){
        const { error, message, members } = await Team.members()
        if( error ) throw new Error( message )

        debug('Members: ', members )
      })
    })
    
    describe('# CSA.workspaces:projects:team.update(...)', function(){
      it('Shoud return JSON response with "member" field as object of updates', async function(){
        const 
        payload = {
          role: 'MAINTAINER'
        },
        { error, message, member } = await Team.update( MEMBER_ID, payload )
        if( error ) throw new Error( message )

        debug('Member: ', member )
      })
    })
    
    describe('# CSA.workspaces:projects:team.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Member Removed"', async function(){
        const { error, status, message } = await Team.remove( MEMBER_ID )
        debug({ error, status, message })
      })
    })
    
    /*
    describe('# CSA.workspaces:projects:team.leave(...)', function(){
      it('Shoud return JSON response with "message" as "Member Left"', async function(){
        const { error, status, message } = await Team.leave()
        debug({ error, status, message })
      })
    })
    */
  })
  
  describe('## Project Activities: (/lib/CSA/wrappers/Workspaces/Projects/Activities.js)', function(){
    describe('# CSA.workspaces:projects:activities.record(...)', function(){
      it('Shoud return JSON response with "activityId"', async function(){
        const
        payload = {
          "type": "git",
          "description": "Initial Commit",
          "details": {
              "repository": "git+https://github.com/pws-hub/protomate",
              "action": "commit",
              "status": "SUCCESS"
          }
        },
        { error, status, message, activityId } = await Activities.record( payload )
        
        activityId ?
            ACTIVITY_ID = activityId
            : console.error({ error, status, message })
      })
    })
    
    describe('# CSA.workspaces:projects:activities.get(...)', function(){
      it('Shoud return JSON response with "activity"', async function(){
        const { error, message, activity } = await Activities.get( ACTIVITY_ID )
        if( error ) throw new Error( message )

        debug('Activity: ', activity )
      })
    })
    
    describe('# CSA.workspaces:projects:activities.list(...)', function(){
      it('Shoud return JSON response with "activities" field as array', async function(){
        const { error, message, activities } = await Activities.list()
        if( error ) throw new Error( message )

        debug('Activities: ', activities )
      })
    })
    
    describe('# CSA.workspaces:projects:activities.remove(...)', function(){
      it('Shoud return JSON response with "message" as "Activity Removed"', async function(){
        const { error, status, message } = await Activities.remove( ACTIVITY_ID )
        debug({ error, status, message })
      })
    })
    
    describe('# CSA.workspaces:projects:activities.clear(...)', function(){
      it('Shoud return JSON response with "message" as "Activities Cleared"', async function(){
        const { error, status, message } = await Activities.clear()
        debug({ error, status, message })
      })
    })
  })
})