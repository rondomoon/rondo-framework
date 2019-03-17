import React from 'react'
import {renderToString} from 'react-dom/server'
import T from 'react-dom/test-utils'
import {Redirect} from './Redirect'
import {LocationDescriptorObject} from 'history'
import {
  MemoryRouter,
  // Redirect as RouterRedirect,
  Route,
} from 'react-router-dom'

function getJSX(to: LocationDescriptorObject | string = '/test1234') {
  return (
    <MemoryRouter initialEntries={['/two']}>
      <Route path='/one' render={() => <span>Ok</span>} />
      <Route path='/two' render={() => <Redirect to={to} />} />
    </MemoryRouter>
  )
}

describe('Redirect - client side', () => {
  it('renders a redirect component', () => {
    T.renderIntoDocument(getJSX())
  })
})

describe('Redirect - server side', () => {
  const g: any = global
  const window = g.window
  beforeEach(() => {
    delete g.window
  })
  afterEach(() => {
    g.window = window
  })

  it('renders a href component', () => {
    const html = renderToString(getJSX())
    expect(html).toContain('<a href="/test1234">here</a>')
  })

  it('handles LocationDescriptorObject', () => {
    const html = renderToString(getJSX({
      pathname: '/test1234',
    }))
    expect(html).toContain('<a href="/test1234">here</a>')
  })
})
