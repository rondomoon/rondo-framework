import * as Feature from './'
// export ReactDOM from 'react-dom'
// import T from 'react-dom/test-utils'
import {HTTPClientMock, TestUtils/*, getError*/} from '../test-utils'
import {IAPIDef} from '@rondo/common'

const test = new TestUtils()

describe('TeamConnector', () => {

  const http = new HTTPClientMock<IAPIDef>()
  const teamActions = new Feature.TeamActions(http)

  const createTestProvider = () => test.withProvider({
    reducers: {Team: Feature.Team},
    connector: new Feature.TeamConnector(teamActions),
    select: state => state.Team,
  })

  it('should render', () => {
    createTestProvider().render()
  })

})
