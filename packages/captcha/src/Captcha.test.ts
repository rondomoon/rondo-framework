import { getValue } from './Captcha'

describe('getValue', () => {
  it('returns value by default', () => {
    expect(getValue('test')).toBe('test')
  })

  it('returns process.env.CAPTCHA value (for testing)', () => {
    expect(getValue('1234', {
      NODE_ENV: 'test',
      CAPTCHA: '5678',
    })).toBe('5678')
  })
})
