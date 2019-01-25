// import {ISite, IStory} from '@rondo/common'
// import {createTeam} from '../team/TeamTestUtils'
// import {test} from '../test'

// describe('team', () => {

//   test.withDatabase()
//   const t = test.request('/api')

//   let cookie!: string
//   let token!: string
//   let team!: ITeam
//   beforeEach(async () => {
//     const session = await test.registerAccount()
//     cookie = session.cookie
//     token = session.token
//     t.setHeaders({ cookie, 'x-csrf-token': token })

//     team = await createTeam(t, 'test')
//   })

//   describe('/stories/by-url', () => {
//     it('returns undefined when a site is not configured', async () => {

//     })

//     it('creates a story when it does not exist', async () => {

//     })

//     it('retrieves existing story after it is created', async () => {

//     })

//     it('prevents unique exceptions', async () => {

//     })
//   })

// })
