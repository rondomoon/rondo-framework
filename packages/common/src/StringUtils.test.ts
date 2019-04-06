import * as StringUtils from './StringUtils'

describe('StringUtils', () => {

  describe('ellipsis', () => {
    it('return "" when maxLength <= 0 or string is undefined', () => {
      expect(StringUtils.ellipsis('test', 0)).toBe('')
      expect(StringUtils.ellipsis(undefined, 100)).toBe('')
    })

    it('defaults maxLength to 255 characters', () => {
      let c = ''
      for (let i = 0; i < 300; i++) {
        c += 'a'
      }
      expect(StringUtils.ellipsis(c)).toBe(c.substring(0, 252))
    })

    it('does nothing when text is not too long', () => {
      expect(StringUtils.ellipsis('test', 4)).toBe('test')
      expect(StringUtils.ellipsis('test', 5)).toBe('test')
      expect(StringUtils.ellipsis('test', 10)).toBe('test')
    })

    it('only shortens strings without spaces', () => {
      expect(StringUtils.ellipsis('test', 3)).toBe('tes')
      expect(StringUtils.ellipsis('test', 2)).toBe('te')
      expect(StringUtils.ellipsis('test', 1)).toBe('t')
      expect(StringUtils.ellipsis('test', 0)).toBe('')
      expect(StringUtils.ellipsis('test', -1)).toBe('')
    })

    it('adds end ellipsis to text with spaces', () => {
      const str = 'this is a test'
      expect(StringUtils.ellipsis(str, 14)).toEqual('this is a test')
      expect(StringUtils.ellipsis(str, 13)).toEqual('this is a...')
      expect(StringUtils.ellipsis(str, 12)).toEqual('this is a...')
      expect(StringUtils.ellipsis(str, 11)).toEqual('this is...')
      expect(StringUtils.ellipsis(str, 10)).toEqual('this is...')
      expect(StringUtils.ellipsis(str, 9)).toEqual('this...')
      expect(StringUtils.ellipsis(str, 8)).toEqual('this...')
      expect(StringUtils.ellipsis(str, 7)).toEqual('this...')
      expect(StringUtils.ellipsis(str, 6)).toEqual('thi...')
      expect(StringUtils.ellipsis(str, 5)).toEqual('th...')
      expect(StringUtils.ellipsis(str, 4)).toEqual('t...')
      expect(StringUtils.ellipsis(str, 3)).toEqual('thi')
      expect(StringUtils.ellipsis(str, 2)).toEqual('th')
      expect(StringUtils.ellipsis(str, 1)).toEqual('t')
    })
  })

  describe('trim', () => {
    it('trims string', () => {
      expect(StringUtils.trim('test')).toEqual('test')
      expect(StringUtils.trim(' test ')).toEqual('test')
      expect(StringUtils.trim(undefined)).toEqual('')
    })
  })

})
