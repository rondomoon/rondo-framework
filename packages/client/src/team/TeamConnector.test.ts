import * as Feature from './'
// export ReactDOM from 'react-dom'
// import T from 'react-dom/test-utils'
import {HTTPClientMock, TestUtils/*, getError*/} from '../test-utils'
import {IAPIDef, ITeam} from '@rondo/common'

const test = new TestUtils()

describe('TeamConnector', () => {

  const http = new HTTPClientMock<IAPIDef>()
  const teamActions = new Feature.TeamActions(http)

  const createTestProvider = () => test.withProvider({
    reducers: {Team: Feature.Team},
    connector: new Feature.TeamConnector(teamActions),
    select: state => state.Team,
  })

  const teams: ITeam[] = [{id: 100, name: 'my-team', userId: 1}]

  it('it fetches user teams on render', async () => {
    http.mockAdd({
      method: 'get',
      url: '/my/teams',
    }, teams)
    const {node} = createTestProvider().render()
    await http.wait()
    expect(node.innerHTML).toContain('my-team')
  })

})
