import { arg, argparse } from '@rondo.dev/argparse'
import { cpus } from 'os'
import { Bootstrap } from '../application'

const numberOfCPUs = cpus().length

const startArgs = {
  host: arg('string', {
    description: '',
  }),
  socket: arg('number', {
    alias: 's',
    description: 'Socket to listen on',
  }),
  port: arg('number', {
    default: 3000,
    alias: 'p',
    description: 'Port to listen on',
  }),
  help: arg('boolean', {alias: 'h'}),
}

export function run(bootstrap: Bootstrap, argv: string[]) {
  const choices: Array<keyof typeof commands> = Object
  .keys(commands) as Array<keyof typeof commands>
  const {parse} = argparse({
    command: arg('string', {
      default: 'start',
      choices,
      positional: true,
      description: 'Command to run',
    }),
    args: arg('string[]', {
      n: '*',
      positional: true,
      description: 'Command arguments',
    }),
    help: arg('boolean', {alias: 'h'}),
  })
  const args = parse(argv)
  const command = args.command as keyof typeof commands
  commands[command](bootstrap, [args.command, ...args.args])
}

const commands = {
  async start(bootstrap: Bootstrap, argv: string[]) {
    const {parse} = argparse(startArgs, 'Start the server')
    const args = parse(argv)
    await bootstrap.listen(args.port || args.socket, args.host)
  },
  async cluster(bootstrap: Bootstrap, argv: string[]) {
    const {parse} = argparse({
      ...startArgs,
      workers: arg('number', {
        alias: 'w',
        description: 'Number of workers to start',
        default: numberOfCPUs,
      }),
    }, 'Start in cluster')
    const args = parse(argv)
    await bootstrap
    .startCluster(args.workers, args.port || args.socket, args.host)
  },
  async migrate(bootstrap: Bootstrap, argv: string[]) {
    const {parse} = argparse({
      undo: arg('boolean', {
        alias: 'u',
        description: 'Undo last migration',
      }),
      help: arg('boolean', {alias: 'h'}),
    })

    const args = parse(argv)

    const {database} = bootstrap
    const connection = await database.connect()
    try {
      await (args.undo
        ? connection.undoLastMigration()
        : connection.runMigrations())
    } finally {
      await connection.close()
    }
  },

}
