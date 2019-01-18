import {ILogger} from './ILogger'
import {Logger, QueryRunner} from 'typeorm'

export class SqlLogger implements Logger {
  constructor(protected readonly logger: ILogger) {}

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    if (parameters) {
      this.logger.info('%s -- %s', query, parameters)
    } else {
      this.logger.info(query)
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
    if (parameters) {
      this.logger.error('%s :: %s -- %s', error, query, parameters)
    } else {
      this.logger.error('%s :: %s', error, query)
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
    if (parameters) {
      this.logger.warn('Slow query: %d :: %s -- %s', time, query, parameters)
    } else {
      this.logger.warn('Slow query: %d :: %s', time, query)
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
    if (level === 'log') {
      level = 'info'
    }
    this.logger[level]('%o', message)
  }
}
