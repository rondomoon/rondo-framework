import { spawn } from 'child_process'
import { Request, Response } from 'express'
import { Readable } from 'stream'

export async function audio(req: Request, res: Response) {
  // TODO generate random string
  const captcha = 'test'
  req.session!.captcha = captcha
  const speech = await speak('test')
  res.type(speech.contentType)
  speech.stdout.pipe(res)
}

async function speak(text: string) {
  const streams: ReadableWritable[] = [
    await espeak(),
    await opus(),
  ]

  const last = streams.reduce((prev, proc) => {
    prev.stdout.pipe(proc.stdin)
    return proc
  }, createTextStream(text))

  return last
}

interface ReadableProcess {
  stdout: NodeJS.ReadableStream
  contentType: string
}

interface WritableProcess {
  stdin: NodeJS.WritableStream
}

interface ReadableWritable extends ReadableProcess, WritableProcess {

}

export function espeak() {
  return run(
    'espeak',
    ['-k', '2', '-s', '90', '--stdin', '--stdout'],
    'audio/wav',
  )
}

async function opus() {
  return run('opusenc', ['-', '-'], 'audio/opus')
}

class TextStream extends Readable {
  constructor(text: string) {
    super()
    this.push(text)
    this.push(null)
  }
  _read() {/* noop */}
}

function createTextStream(text: string): ReadableProcess {
  return {
    stdout: new TextStream(text),
    contentType: 'text/plain',
  }
}

async function run(
  cmd: string, args: string[], contentType: string,
): Promise<ReadableWritable> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)

    p.once('error', err => {
      console.error(err.stack)
      reject(err)
    })

    if (p.pid) {
      resolve({ stdin: p.stdin, stdout: p.stdout, contentType })
    }
  })
}
