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
  description?: string
  default?: TArgType<T>
  required?: boolean
  positional?: boolean
}

export interface IArgsConfig {
  [arg: string]: IArgConfig<TArgTypeName>
}

export type TArgs<T extends IArgsConfig> = {
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
    },
  }
}

function assert(cond: boolean, message: string) {
  if (!cond) {
    throw new Error('Error parsing arguments: ' + message)
  }
}

function getDefaultValue(type: TArgTypeName) {
  switch (type) {
    case 'number':
      return NaN
    case 'string':
      return ''
    case 'boolean':
      return false
  }
}

export const argparse = <T extends IArgsConfig>(
  config: T,
) => (args: string[]): TArgs<T> => {
  const result: any = {}
  const it = iterate(args)

  const aliases: Record<string, string> = {}
  const positional: string[] = []
  const requiredArgs = Object.keys(config).reduce((obj, arg) => {
    const argConfig = config[arg]
    result[arg] = argConfig.default !== undefined
      ? argConfig.default
      : getDefaultValue(argConfig.type)
    if (argConfig.alias) {
      assert(
        argConfig.alias in aliases === false,
        'Duplicate alias: ' + argConfig.alias)
      aliases[argConfig.alias] = arg
    }
    if (argConfig.positional) {
      positional.push(arg)
    }
    if (argConfig.required) {
      obj[arg] = true
    }
    return obj
  }, {} as Record<string, true>)

  function getArgumentName(nameOrAlias: string): string {
    return nameOrAlias in config ? nameOrAlias : aliases[nameOrAlias]
  }

  function processFlags(arg: string): string {
    if (arg.substring(1, 2) === '-') {
      return arg.substring(2)
    }

    const flags = arg.substring(1).split('')

    flags.slice(0, flags.length - 1)
    .forEach(flag => {
      const argName = getArgumentName(flag)
      const argConfig = config[argName]
      assert(!!argConfig, 'Unknown argument: ' + flag)
      assert(argConfig.type === 'boolean',
        'The argument is not a flag/boolean: ' + flag)
      delete requiredArgs[argName]
      result[argName] = true
    })

    const lastArgName = getArgumentName(flags[flags.length - 1])
    assert(!!lastArgName, 'Unknown argument: ' + lastArgName)
    return lastArgName
  }

  function getNextPositional(): string {
    const p = positional.shift()
    assert(!!p, 'No defined positional arguments')
    return p!
  }

  while (it.hasNext()) {
    const arg = it.next()
    const isPositional = arg.substring(0, 1) !== '-'
    const argName = !isPositional
      ? processFlags(arg)
      : getNextPositional()
    const argConfig = config[argName]
    assert(!!argConfig, 'Unknown argument: ' + arg)
    delete requiredArgs[argName]
    const peek = it.peek()
    switch (argConfig.type) {
      case 'string':
        if (isPositional) {
          result[argName] = arg
        } else {
          assert(it.hasNext(), 'Value of argument must be a string: ' + arg)
          result[argName] = it.next()
        }
        continue
      case 'number':
        const num = parseInt(isPositional ? arg : it.next(), 10)
        assert(!isNaN(num), 'Value of argument must be a number: ' + arg)
        result[argName] = num
        continue
      case 'boolean':
        if (isPositional) {
          if (arg === 'true') {
            result[argName] = true
          } else if (arg === 'false') {
            result[argName] = false
          } else {
            assert(false, 'Value of argument must be true or false: ' + arg)
          }
          continue
        }
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
        assert(false, 'Unknown type: ' + argConfig.type)
    }
  }

  assert(!Object.keys(requiredArgs).length, 'Missing required args: ' +
    Object.keys(requiredArgs).join(', '))

  return result
}
