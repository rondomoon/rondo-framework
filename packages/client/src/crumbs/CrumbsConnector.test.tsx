import * as Feature from './'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {TestUtils} from '../test-utils'

const t = new TestUtils()

describe('CrumbsConnector', () => {

  const createTestCase = () => t.withProvider({
    reducers: {Crumbs: Feature.Crumbs},
    select: s => s.Crumbs,
  })
  .withState({
    Crumbs: {
      links: [{
        name: 'One',
        to: '/one',
      }, {
        name: 'Two',
        to: '/two',
      }],
      current: 'Three',
    },
  })
  .withComponent(select => new Feature.CrumbsConnector().connect(select))
  .withJSX(Component => <MemoryRouter><Component /></MemoryRouter>)

  describe('render', () => {
    it('renders', () => {
      const {node} = createTestCase().render({})

      expect(node.innerHTML).toMatch(/href="\/one"/)
      expect(node.innerHTML).toMatch(/href="\/two"/)
      expect(node.innerHTML).toMatch(/Three/)
    })
  })

  describe('BREADCRUMBS_SET', () => {
    it('updates breadcrumbs', () => {
      const {render, store} = createTestCase()
      const actions = new Feature.CrumbsActions()
      store.dispatch(actions.setCrumbs({
        links: [],
        current: 'Crumbtest',
      }))
      const {node} = render({})
      expect(node.innerHTML).toMatch(/Crumbtest/)
    })
  })

})
