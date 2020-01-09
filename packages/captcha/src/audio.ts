import loggerFactory from '@rondo.dev/logger'
import { Request, Response } from 'express'
import SVGCaptcha from 'svg-captcha'
import { Command, ReadableProcess, ReadableWritable, run } from './run'
import { TextStream } from './TextStream'
import { createCaptcha } from './Captcha'

const logger = loggerFactory.getLogger('captcha')

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
  req.session!.captcha = createCaptcha(captcha, 'audio')
  let speech: ReadableProcess
  try {
    speech = await speak(captcha, commands)
  } catch (err) {
    logger.error('Error generating speech: %s', err.stack)
    res.status(500)
    res.send('Internal server error')
    return
  }
  res.status(200)
  res.header('Cache-control', 'no-cache')
  res.type(speech.contentType)
  logger.info('piping output')
  speech.stdout.pipe(res, { end: false })
  speech.stdout.on('end', () => {
    logger.info('end')
    res.end()
  })
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
