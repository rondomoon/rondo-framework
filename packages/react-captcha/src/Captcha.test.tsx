import React from 'react'
import { TestUtils } from '@rondo.dev/react-test'
import { Captcha } from './Captcha'
import T from 'react-dom/test-utils'

describe('Captcha', () => {

  const t = new TestUtils()

  beforeEach(() => {
    render()
  })

  let node: Element
  let component: Captcha
  function render() {
    const result = t.render(
      <Captcha
        audioUrl='/captcha.opus'
        imageUrl='/captcha.svg'
      />,
    )
    node = result.node
    component = T.findRenderedComponentWithType(result.component, Captcha)
  }

  describe('refresh', () => {
    it('updates image / audio key (to reload)', () => {
      const refresh = node.querySelector('.action-refresh')!
      expect(refresh).toBeDefined()
      T.Simulate.click(refresh)
      expect(component.state.attempt).toBe(2)
    })
  })

  describe('changeToAudio & changeToImage', () => {

    it('is set to image by default', () => {
      expect(node.querySelector('img')).toBeTruthy()
      expect(node.querySelector('audio')).toBeFalsy()
    })

    it('switches to audio', () => {
      const btnAudio = node.querySelector('.action-audio')!
      T.Simulate.click(btnAudio)
      expect(node.querySelector('img')).toBeFalsy()
      expect(node.querySelector('audio')).toBeTruthy()
    })

    it('switches to image', () => {
      const btnAudio = node.querySelector('.action-audio')!
      T.Simulate.click(btnAudio)
      const btnImage = node.querySelector('.action-image')!
      T.Simulate.click(btnImage)
      expect(node.querySelector('img')).toBeTruthy()
      expect(node.querySelector('audio')).toBeFalsy()
    })

  })

})
