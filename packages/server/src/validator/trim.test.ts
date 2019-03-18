import {trim} from './trim'

describe('trim', () => {
  it('trims string', () => {
    expect(trim('test')).toEqual('test')
    expect(trim(' test ')).toEqual('test')
    expect(trim(undefined)).toEqual('')
  })
})
