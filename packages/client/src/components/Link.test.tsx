import React from 'react'
import { MemoryRouter } from 'react-router'
import { Route } from 'react-router-dom'
import { TestUtils } from '../test-utils'
import { Link } from './Link'

describe('Link', () => {

  const t = new TestUtils()

  async function render(
    to: string,
    routePath = '/test',
    routerEntry = '/test',
  ) {
    return await t.render(
      <MemoryRouter initialEntries={[routerEntry]}>
        <Route
          path={routePath}
          render={() =>
            <div>
              <Link to={to}>Link Text</Link>
            </div>}
        />
      </MemoryRouter>,
    )
  }

  it('should set href to value', async () => {
    const {node} = await render('/my/link')
    const a = node.querySelector('a') as HTMLElement
    expect(a.tagName).toEqual('A')
    expect(a.getAttribute('href')).toEqual('/my/link')
    expect(a.textContent).toEqual('Link Text')
  })

  it('should format url to matched props', async () => {
    const {node} = await render(
      '/my/:oneId/link/:twoId',
      '/one/:oneId/two/:twoId',
      '/one/1/two/2',
    )
    const a = node.querySelector('a') as HTMLElement
    expect(a.tagName).toEqual('A')
    expect(a.getAttribute('href')).toEqual('/my/1/link/2')
    expect(a.textContent).toEqual('Link Text')
  })

})
