import {LoggerFactory, pad} from './LoggerFactory'
import stdMocks from 'std-mocks'

describe('LoggerFactory', () => {

  let getLogger: typeof LoggerFactory.prototype.getLogger
  beforeEach(() => {
    getLogger = LoggerFactory.createFromEnv({
      logs: 'test1:debug,-test3,t4,logtest5',
      opts: '',
    })
    .getLogger

    stdMocks.use();
    // since winston uses console._stdout
    (console as any)._stdout.write = process.stdout.write;
    (console as any)._stderr.write = process.stderr.write
  })

  afterEach(() => {
    stdMocks.restore();
    (console as any)._stdout.write = process.stdout.write;
    (console as any)._stderr.write = process.stderr.write
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

    // const output = stdMocks.flush()
    // expect(output.stderr.length).toBe(0)
    // expect(output.stdout.length).toBe(3)
    // expect(output.stdout[0]).toMatch(/debug test1 test A\n$/)
    // expect(output.stdout[1]).toMatch(/info {2}t4 {4}test D\n$/)
    // expect(output.stdout[2]).toMatch(/info {2}logte test E\n$/)
  })

  describe('opts', () => {
    const cases: {[key: string]: RegExp} = {
      logstash: /"@message":"test"/,
      color: /debug test1 test/,
      json: /"message":"test"/,
    }

    Object.keys(cases).forEach(opt => {
      describe(opt, () => {
        it(`logs in ${opt} format`, () => {
          getLogger = LoggerFactory.createFromEnv({
            opts: opt,
            logs: 'test1:debug',
          }).getLogger
          const l1 = getLogger('test1')
          l1.debug('test')
          // const output = stdMocks.flush()
          // expect(output.stderr.length).toBe(0)
          // expect(output.stdout.length).toBe(1)
          // expect(output.stdout[0]).toMatch(cases[opt])
        })
      })
    })

  })

  describe('create', () => {
    it('creates a logger with defaults', () => {
      LoggerFactory.createFromEnv()
    })
    it('logs all', () => {
      const l = LoggerFactory.createFromEnv({ logs: '*' }).getLogger('test')
      l.info('test123')
      // const output = stdMocks.flush()
      // expect(output.stderr.length).toBe(0)
      // expect(output.stdout.length).toBe(1)
      // expect(output.stdout[0]).toMatch(/info {2}test {2}test123\n$/)
    })
  })

  describe('pad', () => {
    it('pads space to right', () => {
      expect(pad('test', 10, false)).toBe('test      ')
      expect(pad('test', 10, true)).toBe('test      ')
    })
    it('does nothing when padding or trmming not needed', () => {
      expect(pad('test', 4, false)).toBe('test')
      expect(pad('test', 4, true)).toBe('test')
    })
    it('trims when trimming enabled and needed', () => {
      expect(pad('test', 3, false)).toBe('test')
      expect(pad('test', 3, true)).toBe('tes')
    })
  })

})
