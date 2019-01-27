import {RequestTester} from '../test-utils'
import {IAPIDef} from '@rondo/common'
import {createTeam} from '../team/TeamTestUtils'

export async function createSite(t: RequestTester<IAPIDef>, domain: string) {
  const team = await createTeam(t, 'test')
  const response = await t
  .post('/teams/:teamId/sites', {
    params: {
      teamId: team.id,
    },
  })
  .send({
    domain,
    name: 'test-site',
  })
  .expect(200)
  expect(response.body.id).toBeTruthy()
  return response.body
}
