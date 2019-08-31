import assert from 'assert'
import { createNamespace, Namespace } from 'cls-hooked'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { Database } from '../database/Database'
import { IDatabase } from '../database/IDatabase'
import { loggerFactory, SqlLogger } from '../logger'
import { configureApplication } from './configureApplication'
import { createApplication } from './createApplication'
import { IApplication } from './IApplication'
import { IBootstrap } from './IBootstrap'
import { IConfig } from './IConfig'

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
    return createApplication(configureApplication(this.getConfig(), database))
  }

  async exec(command: string = 'listen') {
    switch (command) {
      case 'listen':
        await this.listen()
        return
      case 'migrate':
        await this.migrate()
        return
      case 'migrate-undo':
        await this.migrateUndo()
        return
      default:
        throw new Error('Unknown command: ' + command)
    }
  }

  async listen(
    port: number | string | undefined = process.env.PORT || 3000,
    hostname: string | undefined= process.env.BIND_HOST,
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

  async migrate() {
    const connection = await this.database.connect()
    await connection.runMigrations()
    await connection.close()
  }

  async migrateUndo() {
    const connection = await this.database.connect()
    await connection.undoLastMigration()
    await connection.close()
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
