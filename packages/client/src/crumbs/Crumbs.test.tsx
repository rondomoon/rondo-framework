import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { TestUtils } from '../test-utils'
import { Crumb } from './Crumb'

const t = new TestUtils()

describe('Crumb', () => {

  describe('render', () => {
    it('renders', () => {
      const {node} = t.render(
        <MemoryRouter>
          <Crumb
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
