import { TypeORMDatabase, TypeORMLogger } from '@rondo.dev/db-typeorm'
import assert from 'assert'
import { createNamespace, Namespace } from 'cls-hooked'
import cluster from 'cluster'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { loggerFactory } from '../logger'
import { Application } from './Application'
import { Bootstrap } from './Bootstrap'
import { Config } from './Config'
import { ServerConfigurator } from './configureServer'
import { createServer } from './createServer'


export interface ServerBootstrapParams {
  readonly config: Config
  readonly configureServer: ServerConfigurator
  readonly namespace?: Namespace
  readonly exit?: (code: number) => void
  readonly entities?: object
  readonly migrations?: object
}

// tslint:disable-next-line
function objToArray(obj: object): Function[] {
  return Object.keys(obj)
  .filter(k => !k.startsWith('_'))
  .map(k => (obj as any)[k])
}

export class ServerBootstrap implements Bootstrap {
  protected config: Config
  protected configureServer: ServerConfigurator
  protected namespace: Namespace
  protected exit: (code: number) => void

  protected server?: Server
  protected inUse = false
  readonly application: Application
  readonly database: TypeORMDatabase

  constructor(params: ServerBootstrapParams) {
    this.config = {
      ...params.config,
      app: {
        ...params.config.app,
        db: {
          ...params.config.app.db,
          entities: params.entities
            ? objToArray(params.entities)
            : params.config.app.db.entities,
          migrations: params.migrations
            ? objToArray(params.migrations)
            : params.config.app.db.migrations,
        },
      },
    }
    this.configureServer = params.configureServer
    this.namespace = params.namespace || createNamespace('application')
    this.exit = params.exit || process.exit

    this.database = this.createDatabase()
    this.application = this.createApplication(this.database)
  }

  getConfig(): Config {
    return this.config
  }

  protected createDatabase(): TypeORMDatabase {
    const {namespace} = this
    const sqlLogger = new TypeORMLogger(
      loggerFactory.getLogger('sql'), namespace)
    return new TypeORMDatabase(namespace, sqlLogger, this.getConfig().app.db)
  }

  protected createApplication(database: TypeORMDatabase): Application {
    const {configureServer} = this
    return createServer(configureServer(this.getConfig(), database))
  }

  async listen(
    port: number | string | undefined = process.env.PORT || 3000,
    hostname: string | undefined = process.env.BIND_HOST,
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

  async startCluster(
    workers: number,
    port?: number | string,
    hostname?: string,
  ) {
    const apiLogger = loggerFactory.getLogger('api')

    if (cluster.isMaster) {
      apiLogger.info('Started master process %d, starting %d workers...',
        process.pid, workers)

      // Fork workers.
      for (let i = 0; i < workers; i++) {
        cluster.fork({
          WORKER_ID: i + 1,
        })
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
      })
    } else {
      await this.listen(port, hostname)
      apiLogger.info(
        'Started worker %d (worker id %s)', process.pid, process.env.WORKER_ID)
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
      const _resolve = () => resolve()
      if (!port) {
        this.server = this.application.server.listen(_resolve)
        return
      } else if (typeof port === 'number' && hostname) {
        this.server = this.application.server.listen(port, hostname, _resolve)
      } else {
        this.server = this.application.server.listen(port, _resolve)
      }
    })

    const apiLogger = loggerFactory.getLogger('api')
    const address = this.getAddress()

    if (typeof address === 'string') {
      apiLogger.info('Listening on %s', address)
    } else {
      apiLogger.info('Listening on %s %s', address.address, address.port)
    }
  }

  getAddress(): AddressInfo | string {
    const address = this.server!.address()
    if (!address) {
      throw new Error('Server addres is null')
    }
    return address
  }

  async close(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.server!.close(err => {
        if (!err) {
          return resolve()
        }
        reject(err)
      })
      this.server = undefined
      this.inUse = false
    })
  }
}
