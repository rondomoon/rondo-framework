import { TestUtils, select } from './index'
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

  type ChangeFn1 = (event: React.ChangeEvent<HTMLInputElement>) => void
  type ChangeFn2 = (event: React.ChangeEvent<HTMLTextAreaElement>) => void

  describe('Selector', () => {
    interface FormProps {
      onSubmit: () => void
      onClick: () => void
      onChange1: ChangeFn1
      onChange2: ChangeFn2
      value1: string
      value2: string
    }

    class Form extends React.PureComponent<FormProps> {
      render() {
        const {props} = this
        return (
          <form onSubmit={props.onSubmit}>
            <span>type stuff</span>
            <input
              onChange={props.onChange1}
              value={props.value1}
              name='value'
            />
            <textarea
              onChange={props.onChange2}
              value={props.value2}
              name='value'
            />
            <input
              onClick={props.onClick}
              type='submit'
            />
          </form>
        )
      }
    }

    const onChange1: jest.Mock<ChangeFn1> = jest.fn()
    const onChange2: jest.Mock<ChangeFn2> = jest.fn()
    const onSubmit = jest.fn()
    const onClick = jest.fn()

    beforeEach(() => {
      onChange1.mockClear()
      onChange2.mockClear()
      onSubmit.mockClear()
      onClick.mockClear()
    })

    const render = async () => {
      return await tu.render(
        <Form
          value1={'a'}
          value2={'b'}
          onChange1={onChange1}
          onChange2={onChange2}
          onSubmit={onSubmit}
          onClick={onClick}
        />,
      )
    }

    describe('type', () => {
      it('dispatches change event', async () => {
        const result = await render()
        const $form = select(result.node)
        const $inputA = $form.findOneByValue('input', 'a')
        expect($inputA.value()).toBe('a')
        $inputA.type('test')
        expect(onChange1.mock.calls[0][0].target).toEqual({ value: 'test' })
      })
    })

    describe('findOne and click', () => {
      it('dispatches click event', async () => {
        const result = await render()
        const $form = select(result.node)
        const $submit = $form.findOne('input[type=submit]')
        $submit.click()
        expect(onClick.mock.calls.length).toBe(1)
      })
    })

    describe('submit', () => {
      it('submits a form', async () => {
        const result = await render()
        const $form = select(result.node)
        $form.submit()
        expect(onSubmit.mock.calls.length).toBe(1)
      })
    })

    describe('findOneByContent', () => {
      it('retrieves an element with textContent', async () => {
        const result = await render()
        const $form = select(result.node)
        const $item = $form.findOneByContent('span', 'type stuff')
        expect($item.tag()).toBe('SPAN')
        expect($item.content()).toBe('type stuff')
      })
    })

    describe('findOneByValue', () => {

    })
  })

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
