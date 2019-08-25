import stdMocks from 'std-mocks'
import loggerFactory, { LoggerFactory } from './'

describe('LoggerFactory', () => {

  let getLogger: typeof LoggerFactory.prototype.getLogger
  beforeEach(() => {
    getLogger = LoggerFactory.init({
      logs: 'test1:verbose,-test3,t4,logtest5',
    })
    .getLogger

    stdMocks.use()

    global.console.log = jest.fn()
    global.console.warn = jest.fn()
    global.console.info = jest.fn()
    global.console.debug = jest.fn()
    global.console.error = jest.fn()
  })

  afterEach(() => {
    stdMocks.flush()
    stdMocks.restore()
  })

  it('logs when enabled', () => {
    const l1 = getLogger('test1')
    const l2 = getLogger('test1')
    const l3 = getLogger('test3')
    const l4 = getLogger('t4')
    const l5 = getLogger('logtest5')
    const l6 = getLogger('logtest6')
    expect(l1).toBe(l2)
    expect(l2).not.toBe(l3)
    l2.debug('test A')
    l3.debug('test B')
    l3.info('test C')
    l4.info('test D')
    l5.info('test E', { test: 5 })
    l6.info('test')
  })

  it('logs when enabled', () => {
    const l1 = getLogger('test1')
    l1.verbose('output: %d', 1)
    l1.debug('output: %d', 2)
    l1.warn('output: %d', 3)
    l1.info('output: %d', 4)
    l1.error('output: %d', 5)

    expect((global.console.warn as any).mock.calls).toEqual([[
      'test1 WARN  output: 3',
    ]])
    expect((global.console.debug as any).mock.calls).toEqual([[
      'test1 VERBO output: 1',
    ], [
      'test1 DEBUG output: 2',
    ]])
    expect((global.console.log as any).mock.calls).toEqual([[
      'test1 INFO  output: 4',
    ]])
    expect((global.console.error as any).mock.calls).toEqual([[
      'test1 ERROR output: 5',
    ]])
  })

  describe('getCorrelationId', () => {
    it('returns an empty string by default', () => {
      expect(loggerFactory.getCorrelationId()).toBe('')
    })
  })

  describe('create', () => {
    it('creates a logger with defaults', () => {
      LoggerFactory.init()
    })
    it('logs all', () => {
      const l = LoggerFactory.init({ logs: '*' }).getLogger('test')
      l.info('test info')
      l.debug('test debug')
      expect((global.console.debug as any).mock.calls).toEqual([])
      expect((global.console.log as any).mock.calls).toEqual([[
        'test INFO  test info',
      ]])
    })
  })

})
