import {RequestTester} from '../test-utils'
import {IAPIDef} from '@rondo/common'

export async function createTeam(t: RequestTester<IAPIDef>, name: string) {
  const response = await t
  .post('/teams')
  .send({
    name: 'test',
  })
  .expect(200)
  expect(response.body.id).toBeTruthy()
  return response.body
}
