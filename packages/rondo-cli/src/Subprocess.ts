import { spawn } from 'child_process'

export enum StdioOptions {
  PIPE = 'pipe',
  INHERIT = 'inherit',
  IGNORE = 'ignore',
}

export class Subprocess {

  static count = 0
  private readonly i: number

  constructor(
    public readonly command: string,
    public readonly args: readonly string[],
    public readonly environment: Record<string, string | undefined>,
    public readonly stdio: StdioOptions = StdioOptions.PIPE,
  ) {
    this.i = ++Subprocess.count
  }

  async run(cwd?: string) {
    const {command, i} = this
    const index = `${i}:${command}`
    return new Promise((resolve, reject) => {
      process.stderr.write(`${index} ${this.args.join(' ')}\n`)
      const subprocess = spawn(command, this.args, {
        shell: false,
        stdio: this.stdio,
        env: this.environment,
        cwd,
      })

      if (this.stdio === StdioOptions.PIPE) {
        subprocess.stdout!.on('data', data => {
          process.stdout.write(`${index}> `)
          process.stdout.write(data)
        })
        subprocess.stderr!.on('data', data => {
          process.stdout.write(`${index}> `)
          process.stderr.write(data)
        })
      }

      subprocess.on('close', code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`"${this.command}" exited with code ${code}`))
        }
      })
      subprocess.on('error', reject)

      const kill = () => {
        process.stderr.write(`Killing ${this.command} ${this.args.join(' ')}\n`)
        subprocess.kill()
      }
      process.on('exit', kill)
      subprocess.on('exit', () => process.removeListener('exit', kill))
    })
  }
}
