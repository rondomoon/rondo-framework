export type TArgTypeName = 'string' | 'number' | 'boolean'
export type TArgType<T extends TArgTypeName> =
  T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never

export interface IArgParam<T extends TArgTypeName> {
  alias?: string
  description?: string
  default?: TArgType<T>
  choices?: Array<TArgType<T>>
  required?: boolean
  positional?: boolean
}

export interface IArgConfig<T extends TArgTypeName> extends IArgParam<T> {
  type: T
}

export interface IArgsConfig {
  [arg: string]: IArgConfig<TArgTypeName>
}

export type TArgs<T extends IArgsConfig> = {
  [k in keyof T]: T[k] extends IArgConfig<infer A> ?
    TArgType<A> : never
}

interface IIterator<T> {
  hasNext(): boolean
  next(): T
  peek(): T
}

const iterate = <T>(arr: T[]): IIterator<T> => {
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

function getBooleanValue(
  it: IIterator<string>,
  argument: string,
  isPositional: boolean,
): boolean {
  if (isPositional) {
    if (argument === 'true') {
      return true
    } else if (argument === 'false') {
      return false
    } else {
      throw new Error('Value of argument must be true or false: ' + arg)
    }
  }
  const peek = it.peek()
  if (peek === 'true') {
    it.next()
    return true
  } else if (peek === 'false') {
    it.next()
    return false
  } else {
    return true
  }
}

function getValue(
  it: IIterator<string>,
  argument: string,
  isPositional: boolean,
): string {
  return isPositional ? argument : it.next()
}

function checkChoice<T>(argument: string, choice: T, choices?: T[]) {
  if (choices) {
    assert(
      choices.some(c => choice === c),
      `Argument "${argument}" must be one of: ${choices.join(', ')}`)
  }
}

export function padRight(str: string, chars: number) {
  while (str.length < chars) {
    str += ' '
  }
  return str
}

export function help(config: IArgsConfig) {
  return Object.keys(config).map(argument => {
    const argConfig = config[argument]
    const {alias, type} = argConfig
    const name = alias
      ? `-${alias}, --${argument}`
      : `    --${argument}`
    const samples = []
    if (argConfig.required) {
      samples.push('required')
    }
    if (argConfig.default) {
      samples.push('default: ' + argConfig.default)
    }
    if (argConfig.choices) {
      samples.push('choices: ' + argConfig.choices.join(','))
    }
    const description = argConfig.description
      ? ' ' + argConfig.description : ''
    const sample = samples.length ? ` (${samples.join(', ')})` : ''
    return padRight(name + ' ' + type, 30) + ' ' + description + sample
  })
  .join('\n')
}

export function arg<T extends TArgTypeName>(
  type: T,
  config: IArgParam<T> = {},
): IArgConfig<T> {
  return {
    ...config,
    type,
  }
}

export function argparse<T extends IArgsConfig>(config: T) {
  return {
    help(): string {
      return help(config)
    },
    parse(args: string[]): TArgs<T> {
      const result: any = {}
      const it = iterate(args)

      const aliases: Record<string, string> = {}
      const positional: string[] = []
      const requiredArgs = Object.keys(config).reduce((obj, argument) => {
        const argConfig = config[argument]
        result[argument] = argConfig.default !== undefined
          ? argConfig.default
          : getDefaultValue(argConfig.type)
        if (argConfig.alias) {
          assert(argConfig.alias.length === 1,
            'Alias must be a single character: ' + argConfig.alias)
          assert(
            argConfig.alias in aliases === false,
            'Duplicate alias: ' + argConfig.alias)
          aliases[argConfig.alias] = argument
        }
        if (argConfig.positional) {
          positional.push(argument)
        }
        if (argConfig.required) {
          obj[argument] = true
        }
        return obj
      }, {} as Record<string, true>)

      function getArgumentName(nameOrAlias: string): string {
        return nameOrAlias in config ? nameOrAlias : aliases[nameOrAlias]
      }

      function processFlags(argument: string): string {
        if (argument.substring(1, 2) === '-') {
          return argument.substring(2)
        }

        const flags = argument.substring(1).split('')

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
        const argument = it.next()
        const isPositional = argument.substring(0, 1) !== '-'
        const argName = !isPositional
          ? processFlags(argument)
          : getNextPositional()
        const argConfig = config[argName]
        assert(!!argConfig, 'Unknown argument: ' + argument)
        delete requiredArgs[argName]
        switch (argConfig.type) {
          case 'string':
            result[argName] = getValue(it, argument, isPositional)
            assert(!!result[argName],
              'Value of argument must be a string: ' + argument)
            break
          case 'number':
            const num = parseInt(getValue(it, argument, isPositional), 10)
            assert(!isNaN(num),
              'Value of argument must be a number: ' + argument)
            result[argName] = num
            break
          case 'boolean':
            result[argName] = getBooleanValue(it, argument, isPositional)
            break
          default:
            assert(false, 'Unknown type: ' + argConfig.type)
        }
        checkChoice(argument, result[argName], argConfig.choices)
      }

      assert(!Object.keys(requiredArgs).length, 'Missing required args: ' +
        Object.keys(requiredArgs).join(', '))

      return result
    },
  }
}
