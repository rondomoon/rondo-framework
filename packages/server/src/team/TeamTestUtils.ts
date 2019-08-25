import {RequestTester} from '../test-utils'
import {IAPIDef} from '@rondo.dev/common'

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

export async function addUser(t: RequestTester<IAPIDef>, params: {
  teamId: number,
  userId: number,
}) {
  await t
  .post('/teams/:teamId/users/:userId', {
    params: {
      teamId: params.teamId,
      userId: params.userId,
    },
  })
  .expect(200)
}

export async function removeUser(t: RequestTester<IAPIDef>, params: {
  teamId: number,
  userId: number,
}) {
  await t
  .delete('/teams/:teamId/users/:userId', {
    params: {
      teamId: params.teamId,
      userId: params.userId,
    },
  })
  .expect(200)
}

export async function findUsers(t: RequestTester<IAPIDef>, params: {
  teamId: number,
}) {
  const response = await t
  .get('/teams/:teamId/users', {
    params: {
      teamId: params.teamId,
    },
  })
  .expect(200)
  return response.body
}
