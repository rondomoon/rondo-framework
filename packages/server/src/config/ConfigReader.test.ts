import {ConfigReader} from './ConfigReader'
import {join} from 'path'
import {writeFileSync} from 'fs'

describe('ConfigReader', () => {

  beforeAll(() => {
    writeFileSync(
      join(__dirname, 'test-files', 'package.json'),
      '{}',
    )
  })

  describe('read', () => {

    it('reads and merges configuration files from package root', () => {
      const config = new ConfigReader(__dirname).read()
      expect(config.get('app.name')).toEqual(jasmine.any(String))
    })

    it('reads and merges configuration files from CWD', () => {
      const config = new ConfigReader(
        join(__dirname, 'test-files', 'dir'),
        '/tmp/path',
      ).read()
      expect(config.value()).toEqual({
        a: 1,
        b: 'test',
        c: {
          d: 'value',
          e: ['entry 3'],
          f: 'extra value',
        },
      })
    })

    it('fails when not a single config file found', () => {
      expect(() => new ConfigReader('/tmp/test', '/tmp/test').read())
      .toThrowError('No config files found')
    })

    it('succeeds when custom filename is read', () => {
      expect(() => new ConfigReader('/tmp/test', '/tmp/test').read())
      .toThrowError('No config files found')
    })

    describe('environment variable', () => {
      const origConfig = process.env.CONFIG
      afterEach(() => {
        process.env.CONFIG = origConfig
      })

      it('succeeds when config from env variable is read', () => {
        process.env.CONFIG = '---\na: 2'
        const config = new ConfigReader(
          join(__dirname, 'test-files', 'dir'),
          '/tmp/path',
        ).read()
        expect(config.value()).toEqual({
          a: 2,
          b: 'test',
          c: {
            d: 'value',
            e: ['entry 3'],
            f: 'extra value',
          },
        })
      })
    })

  })
})
