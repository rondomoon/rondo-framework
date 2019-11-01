jest.mock('child_process')
jest.mock('fs')
jest.mock('../log')

import cp from 'child_process'
import * as fs from 'fs'
import {update} from './update'

describe('update', () => {

  const stringify = (obj: object) => JSON.stringify(obj, null, '  ')

  const readMock =
    fs.readFileSync as unknown as jest.Mock<typeof fs.readFileSync>
  const writeMock = fs.writeFileSync as jest.Mock<typeof fs.writeFileSync>
  const cpMock = cp.execFileSync as unknown as jest.Mock<typeof cp.execFileSync>

  beforeEach(() => {
    cpMock.mockClear()
    readMock.mockClear()
    writeMock.mockClear()

    cpMock.mockImplementation(() => Buffer.from('7.8.9\n') as any)
    readMock.mockReturnValue(stringify({
      name: 'test',
      dependencies: {
        a: '^1.2.3',
      },
      devDependencies: {
        b: '^3.4.6',
      },
    }) as any)
  })

  it('updates outdated dependencies in package.json', async () => {
    await update('update', '/my/dir')
    expect(writeMock.mock.calls).toEqual([[
      '/my/dir/package.json', stringify({
        name: 'test',
        dependencies: {
          a: '^7.8.9',
        },
        devDependencies: {
          b: '^7.8.9',
        },
      }),
    ]])
  })

  it('does not fail when package has no deps', async () => {
    readMock.mockReturnValue(stringify({}) as any)
    await update('update', '/my/dir')
  })

  it('does not write when dryRun', async () => {
    readMock.mockReturnValue(stringify({}) as any)
    await update('update', '--dryRun', '/my/dir')
    expect(writeMock.mock.calls.length).toBe(0)
  })

})
