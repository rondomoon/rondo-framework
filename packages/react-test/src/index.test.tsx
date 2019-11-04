import { TestUtils } from './index'
import React from 'react'

describe('TestUtils', () => {

  TestUtils.defaultTheme = {}
  const tu = new TestUtils()

  const Functional: React.FunctionComponent<{}> = () => <span>fn</span>
  class Class extends React.PureComponent<{}> {
    render() {
      return <span>class</span>
    }
  }

  describe('render', () => {
    it('renders a class component', async () => {
      const { node, component } = await tu.render(<Class />)
      expect(node).toBeTruthy()
      expect(node.tagName).toBe('SPAN')
      expect(node.innerHTML).toBe('class')
      tu.Utils.findRenderedComponentWithType(component, Class)
    })
    it('renders a functional component', async () => {
      const { node, component } = await tu.render(<Functional />)
      expect(node).toBeTruthy()
      expect(node.tagName).toBe('SPAN')
      expect(node.innerHTML).toBe('fn')
      expect(component).toBeTruthy()
    })
    it('renders a html component', async () => {
      const { node, component } = await tu.render(<span>text</span>)
      expect(node).toBeTruthy()
      expect(node.tagName).toBe('SPAN')
      expect(node.innerHTML).toBe('text')
      expect(component).toBeTruthy()
    })
  })

})
