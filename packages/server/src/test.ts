import {Bootstrap} from './application/Bootstrap'
import {IAPIDef} from '@rondo/common'
import {NamespaceMock, TestUtils} from './test-utils'
import {config} from './config'

export const exit = jest.fn()

const bootstrap = new Bootstrap(
  config,
  new NamespaceMock(),
  exit,
)

export const test = new TestUtils<IAPIDef>(bootstrap)
export const {request} = test
