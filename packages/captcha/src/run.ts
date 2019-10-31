import { spawn } from 'child_process'

export interface ReadableProcess {
  stdout: NodeJS.ReadableStream
  contentType: string
}

export interface WritableProcess {
  stdin: NodeJS.WritableStream
}

export interface ReadableWritable extends ReadableProcess, WritableProcess {

}

export interface Command {
  cmd: string
  args: string[]
  contentType: string
}

export async function run(command: Command): Promise<ReadableWritable> {
  const { cmd, args, contentType } = command
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)

    p.once('error', err => {
      reject(err)
    })

    if (p.pid) {
      resolve({ stdin: p.stdin, stdout: p.stdout, contentType })
    }
  })
}
