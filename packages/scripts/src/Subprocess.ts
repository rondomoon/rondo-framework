import {spawn} from 'child_process'

export enum StdioOptions {
  PIPE = 'pipe',
  INHERIT = 'inherit',
  IGNORE = 'ignore',
}

export class Subprocess {

  constructor(
    public readonly command: string,
    public readonly args: readonly string[],
    public readonly environment: Record<string, string | undefined>,
    public readonly stdio: StdioOptions = StdioOptions.PIPE,
  ) {}

  async run() {
    return new Promise((resolve, reject) => {
      process.stderr.write(`> ${this.command} ${this.args.join(' ')}\n`)
      const subprocess = spawn(this.command, this.args, {
        shell: false,
        stdio: this.stdio,
        env: this.environment,
      })

      if (this.stdio === StdioOptions.PIPE) {
        subprocess.stdout.on('data', data => process.stdout.write(data))
        subprocess.stderr.on('data', data => process.stderr.write(data))
      }

      subprocess.on('close', code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`"${this.command}" exited with code ${code}`))
        }
      })
      let exited = false
      subprocess.on('exit', () => exited = true)
      subprocess.on('error', reject)

      process.on('exit', () => {
        if (!exited) {
          subprocess.kill()
        }
      })
    })
  }
}
