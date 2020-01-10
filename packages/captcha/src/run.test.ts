import { run } from './run'
import { getError } from '@rondo.dev/test-utils'
import { extname, join } from 'path'

describe('run', () => {

  async function read(readable: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      readable.on('error', err => reject(err))
      readable.on('readable', () => {
        let data = ''
        let chunk
        while (null !== (chunk = readable.read())) {
          data += chunk
        }
        resolve(data)
      })
    })
  }


  it('runs a process and returns stdin/stdout/contentType', async () => {
    const result = await run({
      cmd: process.argv[0],
      args: [join(__dirname, 'testProcess' + extname(__filename))],
      contentType: 'text/plain',
    })
    expect(result.contentType).toBe('text/plain')
    result.stdin.write('test')
    const text = await read(result.stdout)
    expect(text.trim()).toBe('test')
  })

  it('rejects when command is invalid', async () => {
    const error = await getError(run({
      cmd: 'invalid-command',
      args: ['test'],
      contentType: 'text/plain',
    }))
    expect(error.message).toMatch(/ENOENT/)
  })

})
