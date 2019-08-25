import { getDefaultParams } from './getDefaultParams'

describe('getDefaultParams', () => {

  const window = (global as any).window
  beforeEach(() => {
    delete process.env.LOG
  })

  afterEach(() => {
    (global as any).window = window
  })

  it('returns an empty string', () => {
    delete (global as any).window
    expect(getDefaultParams()).toEqual('')
  })

  it('reads process.env.LOG if available', () => {
    process.env.LOG = 'test-env'
    expect(getDefaultParams()).toEqual('test-env')
  })

  it('reads from localStorage.LOG if available', () => {
    localStorage.setItem('LOG', 'test-ls')
    expect(getDefaultParams()).toEqual('test-ls')
    localStorage.removeItem('LOG')
    expect(getDefaultParams()).toEqual('')
  })

  it('reads from localStorage.LOG if available', () => {
    localStorage.setItem('LOG', 'test-ls')
    expect(getDefaultParams()).toEqual('test-ls')
  })

})
