jest.mock('child_process')
jest.mock('fs')
jest.mock('../log')

import cp from 'child_process'
import * as fs from 'fs'
import {update, Outdated} from './update'

describe('update', () => {

  const stringify = (obj: object) => JSON.stringify(obj, null, '  ')

  const readMock =
    fs.readFileSync as unknown as jest.Mock<typeof fs.readFileSync>
  const writeMock = fs.writeFileSync as jest.Mock<typeof fs.writeFileSync>
  const cpMock = cp.execFileSync as unknown as jest.Mock<typeof cp.execFileSync>

  let outdated: Record<string, Outdated> = {}
  beforeEach(() => {
    outdated = {}

    cpMock.mockClear()
    readMock.mockClear()
    writeMock.mockClear()

    cpMock.mockImplementation(() => {
      const err = new Error('Exit code 1');
      (err as any).stdout = stringify(outdated)
      throw err
    })
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

  it('does not change when no changes', async () => {
    cpMock.mockReturnValue('{}' as any)
    await update('update', '/my/dir')
    expect(writeMock.mock.calls.length).toBe(0)
  })

  it('does not change when npm outdated output is empty', async () => {
    cpMock.mockReturnValue('' as any)
    await update('update', '/my/dir')
    expect(writeMock.mock.calls.length).toBe(0)
  })

  it('updates outdated dependencies in package.json', async () => {
    outdated = {
      a: {
        wanted: '1.2.3',
        latest: '1.4.0',
        location: '',
      },
      b: {
        wanted: '3.4.6',
        latest: '3.4.7',
        location: '',
      },
    }
    await update('update', '/my/dir')
    expect(writeMock.mock.calls).toEqual([[
      '/my/dir/package.json', stringify({
        name: 'test',
        dependencies: {
          a: '^1.4.0',
        },
        devDependencies: {
          b: '^3.4.7',
        },
      }),
    ]])
  })

})
