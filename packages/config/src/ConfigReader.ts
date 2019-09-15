import loggerFactory, { Logger } from '@rondo.dev/logger'
import { readFileSync } from 'fs'
import YAML from 'js-yaml'
import { join } from 'path'
import { Config } from './Config'
import { findPackageRoot } from './findPackageRoot'

const isObject = (value: unknown) => value !== null && typeof value === 'object'

export class ConfigReader {
  protected readonly config: any = {}
  protected readonly locations: string[]
  protected readonly filenames: string[]

  constructor(
    readonly path: string,
    readonly cwd: string | undefined = process.cwd(),
    readonly environment = 'CONFIG',
    readonly logger: Logger = loggerFactory.getLogger('config'),
  ) {
    const packageRoot = path && findPackageRoot(path)
    this.locations = packageRoot ? [packageRoot] : []
    if (cwd && cwd !== packageRoot) {
      this.locations.push(cwd)
    }
    this.filenames = [
      'default.yml',
      `${process.env.NODE_ENV || 'development'}.yml`,
    ]
  }

  read(filename?: string) {
    let success = 0
    for (const location of this.locations) {
      for (const fname of this.filenames) {
        const configFilename = join(location, 'config', fname)
        try {
          this.readFile(configFilename)
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err
          }
          continue
        }
        this.logger.info('config: Found config file: %s', configFilename)
        success += 1
      }
    }

    const env = process.env[this.environment]
    if (!filename && !env && !success) {
      throw new Error('No config files found')
    }

    if (filename) {
      this.logger.info('config: Reading extra config file: %s', filename)
      this.readFile(filename)
    }

    if (env) {
      this.logger.info('config: Parsing env variable: %s', this.environment)
      this.parse(env)
    }

    return new Config(this.config)
  }

  readFile(filename: string) {
    const yaml = readFileSync(filename, 'utf-8')
    const config = YAML.safeLoad(yaml)
    if (config) {
      this.mergeConfig(config, this.config)
    }
  }

  parse(yaml: string) {
    const config = YAML.safeLoad(yaml)
    this.mergeConfig(config, this.config)
  }

  protected mergeConfig(source: any, destination: any) {
    const stack = [{src: source, dest: destination}]

    // let i = 0
    while (stack.length) {
      // i++
      const {src, dest} = stack.pop()!
      const keys = Object.keys(src)

      keys.forEach(key => {
        // if (i > 100) {
        //   throw new Error('overload')
        // }
        const value = src[key]
        if (isObject(value) && !Array.isArray(value)) {
          if (
            !Object.prototype.hasOwnProperty.call(dest, key) ||
            Array.isArray(dest[key]) ||
            !isObject(dest[key])
          ) {
            dest[key] = {}
          }
          stack.push({src: value, dest: dest[key]})
          return
        }
        dest[key] = value
      })
    }

    return destination
  }

}
