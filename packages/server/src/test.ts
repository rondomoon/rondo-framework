import {Bootstrap} from './application/Bootstrap'
import {IAPIDef} from '@rondo.dev/common'
import {TestUtils} from './test-utils'
import {config} from './config'
import {createNamespace} from 'cls-hooked'

export const exit = jest.fn()

export const bootstrap = new Bootstrap(
  config,
  createNamespace('test'),
  exit,
)

// TODO separate IAPIDef between projects
export const test = new TestUtils<IAPIDef>(bootstrap)
export const {request} = test
