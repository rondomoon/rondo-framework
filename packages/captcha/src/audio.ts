import { Request, Response } from 'express'
import SVGCaptcha from 'svg-captcha'
import { Command, ReadableProcess, ReadableWritable, run } from './run'
import { TextStream } from './TextStream'

export interface AudioConfig {
  commands: Command[]
  size: number
}

export const audio = (config: AudioConfig) => async (
  req: Request,
  res: Response,
) => {
  const { commands, size } = config
  const captcha = SVGCaptcha.randomText(size)
  req.session!.captcha = captcha
  let speech: ReadableProcess
  try {
    speech = await speak('test', commands)
  } catch (err) {
    res.status(500)
    res.send('Internal server error')
    return
  }
  res.type(speech.contentType)
  speech.stdout.pipe(res)
}

export async function speak(
  text: string,
  commands: Command[],
): Promise<ReadableProcess> {
  const streams: ReadableWritable[] = []
  for (const command of commands) {
    streams.push(await run(command))
  }

  const last = streams.reduce((prev, proc) => {
    prev.stdout.pipe(proc.stdin)
    return proc
  }, createTextStream(text))

  return last
}

function createTextStream(text: string): ReadableProcess {
  return {
    stdout: new TextStream(text),
    contentType: 'text/plain',
  }
}
