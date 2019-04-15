import assert from 'assert'
import {AddressInfo} from 'net'
import {Application} from './Application'
import {Database} from '../database/Database'
import {IApplication} from './IApplication'
import {IBootstrap} from './IBootstrap'
import {IConfig} from './IConfig'
import {IDatabase} from '../database/IDatabase'
import {Server} from 'http'
import {SqlLogger, loggerFactory} from '../logger'
import {createNamespace, Namespace} from 'cls-hooked'

export class Bootstrap implements IBootstrap {
  protected server?: Server
  protected inUse: boolean = false
  readonly application: IApplication
  readonly database: IDatabase

  constructor(
    private readonly config: IConfig,
    protected readonly namespace: Namespace = createNamespace('application'),
    protected readonly exit: (code: number) => void = process.exit,
  ) {
    this.database = this.createDatabase()
    this.application = this.createApplication(this.database)
  }

  getConfig(): IConfig {
    return this.config
  }

  protected createDatabase(): IDatabase {
    const sqlLogger = new SqlLogger(
      loggerFactory.getLogger('sql'), this.namespace)
    return new Database(this.namespace, sqlLogger, this.getConfig().app.db)
  }

  protected createApplication(database: IDatabase): IApplication {
    return new Application(this.getConfig(), database)
  }

  async listen(
    port: number | string | undefined = process.env.PORT,
    hostname?: string,
  ) {
    const apiLogger = loggerFactory.getLogger('api')
    try {
      await this.start(port, hostname)
    } catch (err) {
      apiLogger.error('Error starting server: %s', err.stack)
      this.exit(1)
      throw err
    }
  }

  protected async start(
    port: number | string | undefined = process.env.PORT,
    hostname?: string,
  ): Promise<void> {
    assert.ok(!this.inUse, 'Server already in use!')
    this.inUse = true

    await this.database.connect()

    await new Promise((resolve, reject) => {
      if (!port) {
        this.server = this.application.server.listen(resolve)
        return
      } else if (typeof port === 'number' && hostname) {
        this.server = this.application.server.listen(port, hostname, resolve)
      } else {
        this.server = this.application.server.listen(port, resolve)
      }
    })

    const apiLogger = loggerFactory.getLogger('api')

    if (hostname) {
      apiLogger.info('Listening on %s %s', port, hostname)
    } else {
      apiLogger.info('Listening on %s', port)
    }
  }

  getAddress(): AddressInfo | string {
    return this.server!.address()
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server!.close(resolve)
      this.server = undefined
      this.inUse = false
    })
  }
}
