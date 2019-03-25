import React from 'react'
import {Breadcrumbs} from './Breadcrumbs'
import {TestUtils} from '../test-utils'
import {MemoryRouter} from 'react-router-dom'

const t = new TestUtils()

describe('Breadcrumbs', () => {

  describe('render', () => {
    it('renders', () => {
      const {node} = t.render(
        <MemoryRouter>
          <Breadcrumbs
            links={[{
              name: 'one',
              to: '/one',
            }, {
              name: 'two',
              to: '/two',
            }]}
            current='three'
          />
        </MemoryRouter>,
      )
      expect(node.innerHTML).toMatch(/href="\/one"/)
      expect(node.innerHTML).toMatch(/href="\/two"/)
      expect(node.innerHTML).toMatch(/three/)
    })
  })

})
