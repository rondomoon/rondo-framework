export * from './ILoggerFactory'
export * from './IMessage'
export * from './LogLevel'
export * from './Logger'
export * from './LoggerFactory'

import {LoggerFactory} from './LoggerFactory'
export default LoggerFactory.init()

import * as transports from './transports'
export {transports}

import * as formatters from './formatters'
export {formatters}

import * as logger from './logger'
export {logger}
