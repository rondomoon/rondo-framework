import { Bootstrap } from "../application";
import { argparse, arg } from "@rondo.dev/argparse";

export class CLI {
  constructor(readonly bootstrap: Bootstrap) {
  }

  execute(argv: string[]) {
    const choices: Array<keyof typeof commands> = ['start', 'migrate']
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
    commands[command](this.bootstrap, [args.command, ...args.args])
  }

}

const commands = {
  async start(bootstrap: Bootstrap, argv: string[]) {
    const {parse} = argparse({
      host: arg('string', {
        description: '',
      }),
      socket: arg('number', {
        alias: 's',
        description: 'Socket to listen on',
      }),
      port: arg('number', {
        alias: 'p',
        description: 'Port to listen on',
      }),
      help: arg('boolean', {alias: 'h'}),
    })
    const args = parse(argv)
    await bootstrap.listen(args.port || args.socket, args.host)
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
