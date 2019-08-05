export type TArgTypeName = 'string' | 'number' | 'boolean'
export type TArgType<T extends TArgTypeName> =
  T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never

export interface IArgConfig<T extends TArgTypeName> {
  type: T
  alias?: string
  default?: TArgType<T>
  required?: boolean
}

export interface IArgsConfig {
  [arg: string]: IArgConfig<TArgTypeName>
}

export type TArgs<T> = {
  [k in keyof T]: T[k] extends IArgConfig<infer A> ?
    TArgType<A> : never
}

const iterate = <T>(arr: T[]) => {
  let i = -1
  return {
    hasNext() {
      return i < arr.length - 1
    },
    next(): T {
      return arr[++i]
    },
    peek(): T {
      return arr[i + 1]
    }
  }
}

function assert(cond: boolean, message: string) {
  if (!cond) {
    throw new Error('Error parsing arguments: ' + message)
  }
}

export function argparse<T extends object>(
  args: string[],
  config: T extends IArgsConfig ? T : never,
): TArgs<T> {
  const result = {} as TArgs<T>
  const it = iterate(args)

  const usedArgs: Record<string, true> = {}
  const aliases: Record<string, string> = {}
  const requiredArgs = Object.keys(config).reduce((obj, arg) => {
    const argConfig = config[arg]
    if (argConfig.default !== undefined) {
      result[arg] = argConfig.default
    }
    if (argConfig.alias) {
      aliases[argConfig.alias] = arg
    }
    obj[arg] = !!argConfig.required
    return obj
  }, {} as Record<string, boolean>)

  while(it.hasNext()) {
    const arg = it.next()
    assert(arg.substring(0, 1) === '-', 'Arguments must start with -')
    let argName: string
    if (arg.substring(1, 2) !== '-') {
      // flags
      const flags = arg.substring(1).split('')

      flags.slice(0, flags.length - 2)
      .forEach(flag => {
        const alias = aliases[flag]
        const argConfig = config[alias]
        assert(!!argConfig, 'Unknown flag: ' + flag)
        assert(argConfig.type === 'boolean', 'The argument is not a flag/boolean: ' + flag)
        delete requiredArgs[alias]
        result[alias] = true
      })

      const lastArg = flags[flags.length - 1]
      argName = aliases[lastArg]
    } else {
      argName = arg.substring(2)
    }
    const argConfig = config[argName]
    assert(!!argConfig, 'Unknown argument: ' + arg)
    delete requiredArgs[argName]
    usedArgs[argName] = true
    const peek = it.peek()
    switch(argConfig.type) {
      case 'string':
        assert(it.hasNext(), 'Value of argument must be a string: ' + arg)
        result[argName] = it.next()
        continue
      case 'number':
        const num = parseInt(it.next(), 10)
        assert(!isNaN(num), 'Value of argument must be a number: ' + arg)
        result[argName] = num
        continue
      case 'boolean':
        if (peek === 'true') {
          it.next()
          result[argName] = true
        } else if (peek === 'false') {
          it.next()
          result[argName] = false
        } else {
          result[argName] = true
        }
        continue
      default:
        throw new Error('Unknown type:' + argConfig.type)
    }
  }

  assert(!Object.keys(requiredArgs).length, 'Missing required args: ' +
    Object.keys(requiredArgs).map(r => '--' + r))

  return result
}
