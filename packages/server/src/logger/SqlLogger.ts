import {ILogger} from './ILogger'
import {Logger, QueryRunner} from 'typeorm'
import {Namespace} from 'cls-hooked'
import {CORRELATION_ID} from '../middleware/Transaction'

export class SqlLogger implements Logger {
  constructor(
    protected readonly logger: ILogger,
    protected readonly ns: Namespace,
  ) {}

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    const correlationId = this.getCorrelationId()
    if (parameters) {
      this.logger.info('%s %s -- %s', correlationId, query, parameters)
    } else {
      this.logger.info('%s %s', correlationId, query)
    }
  }
  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const correlationId = this.getCorrelationId()
    if (parameters) {
      this.logger.error('%s %s :: %s -- %s',
        correlationId, error, query, parameters)
    } else {
      this.logger.error('%s %s :: %s', correlationId, error, query)
    }
  }
  /**
   * Logs query that is slow.
   */
  logQuerySlow(
    time: number, query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const correlationId = this.getCorrelationId()
    if (parameters) {
      this.logger.warn('%s Slow query: %d :: %s -- %s',
        correlationId, time, query, parameters)
    } else {
      this.logger.warn('%s Slow query: %d :: %s',
        correlationId, time, query)
    }
  }
  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.info(message)
  }
  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.info(message)
  }
  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ) {
    const correlationId = this.getCorrelationId()
    if (level === 'log') {
      level = 'info'
    }
    this.logger[level]('%s %o', correlationId, message)
  }

  protected getCorrelationId(): string | undefined {
    const correlationId: string = this.ns.get(CORRELATION_ID)
    return correlationId || ''
  }

}
