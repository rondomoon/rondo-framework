import {relative} from 'path'

export type TArgTypeName = 'string' | 'string[]' | 'number' | 'boolean'
export type TArgType<T extends TArgTypeName> =
  T extends 'string'
  ? string
  : T extends 'string[]'
  ? string[]
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : never

export const N_ONE_OR_MORE = '+'
export const N_ZERO_OR_MORE = '*'
export const N_DEFAULT_VALUE = 1

export type TNumberOfArgs = number | '+' | '*'

export interface IArgParam<T extends TArgTypeName> {
  alias?: string
  description?: string
  default?: TArgType<T>
  choices?: Array<TArgType<T>>
  required?: boolean
  positional?: boolean
  n?: TNumberOfArgs
}

export interface IArgument<T extends TArgTypeName> extends IArgParam<T> {
  type: T
}

export interface IArgsConfig {
  [arg: string]: IArgument<TArgTypeName>
}

export type TArgs<T extends IArgsConfig> = {
  [k in keyof T]: T[k] extends IArgument<infer A> ?
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

function createError(message: string) {
  return new Error('Error parsing arguments: ' + message)
}

function assert(cond: boolean, message: string) {
  if (!cond) {
    throw createError(message)
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
    case 'string[]':
      return [] as string[]
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

function extractArray(
  it: IIterator<string>,
  argument: string,
  isPositional: boolean,
  n: TNumberOfArgs = N_DEFAULT_VALUE,
): string[] {
  function getLimit() {
    const l = typeof n === 'number' ? n : Infinity
    return isPositional ? l - 1 : l
  }
  const limit = getLimit()
  const array = isPositional ? [argument] : []
  let i = 0
  for (; i < limit && it.hasNext(); i++) {
    array.push(it.next())
  }
  if (typeof n === 'number') {
    assert(i === limit,
      `Expected ${limit} arguments for ${argument}, but got ${i}`)
  }
  return array
}

function checkChoice<T>(argument: string, choice: T, choices?: T[]) {
  if (choices) {
    assert(
      choices.some(c => choice === c),
      `Argument "${argument}" must be one of: ${choices.join(', ')}`)
  }
}

function padRight(str: string, chars: number) {
  while (str.length < chars) {
    str += ' '
  }
  return str
}

function help(command: string, config: IArgsConfig, desc: string = '') {
  const keys = Object.keys(config)

  function getArrayHelp(
    k: string,
    required?: boolean,
    n: TNumberOfArgs = N_DEFAULT_VALUE,
  ) {
    k = k.toUpperCase()
    if (n === N_ZERO_OR_MORE) {
      return `[${k}...]`
    }
    if (n === N_ONE_OR_MORE) {
      return required ? `${k}...` : `[${k}...]`
    }
    if (n === 1) {
      return required ? k : `[${k}]`
    }

    const limit: number = n
    const array = []
    for (let i = 0; i < limit; i++) {
      array.push(k + (i + 1))
    }
    return required ? array.join(' ') : `[${array.join(' ')}]`
  }

  function getDescription(argConfig: IArgument<TArgTypeName>): string {
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
    return description + sample
  }

  function getPaddedName(nameAndType: string, description: string) {
    return description
      ? padRight(nameAndType, 30) + ' ' + description
      : nameAndType
  }

  function getArgType(
    type: TArgTypeName, argument: string, required?: boolean, n?: TNumberOfArgs,
  ): string {
    return type === 'string[]'
      ? getArrayHelp(argument, required, n)
      : type
  }

  const positionalArgs = keys
  .filter(k => config[k].positional)
  .map(argument => {
    const argConfig = config[argument]
    const {type, required, n} = argConfig
    const nameAndType = `  ${argument.toUpperCase()} ${type}`
    const description = getDescription(argConfig)
    return getPaddedName(nameAndType, description)
  })

  const options = keys
  .filter(k => !config[k].positional)
  .map(argument => {
    const argConfig = config[argument]
    const {alias, type, required, n} = argConfig
    const name = alias
      ? `  -${alias}, --${argument}`
      : `      --${argument}`
    const description = getDescription(argConfig)
    const argType = getArgType(type, argument, required, n)
    const nameAndType = `${name} ${argType}`
    return getPaddedName(nameAndType, description)
  })

  const positionalHelp = positionalArgs.length
    ? 'Positional arguments:\n' + positionalArgs.join('\n')
    : ''
  const optionsHelp = options.length
    ? 'Options:\n' + options.join('\n')
    : ''

  const commandHelp = [
    relative(process.cwd(), command),
    options.length ? '[OPTIONS]' : '',
    keys
    .filter(k => config[k].positional)
    .map(k => getArrayHelp(k, config[k].required, config[k].n))
    .join(' '),
  ]
  .filter(k => k.length)
  .join(' ')

  return [commandHelp, desc, positionalHelp, optionsHelp]
  .filter(h => h.length)
  .join('\n\n')
}

export function arg<T extends TArgTypeName>(
  type: T,
  config: IArgParam<T> = {},
): IArgument<T> {
  return {
    ...config,
    type,
  }
}

export function argparse<T extends IArgsConfig>(
  config: T,
  description: string = '',
  exit: () => void = () => process.exit(),
  /* tslint:disable-next-line */
  log: (message: string) => void = console.log.bind(console),
) {
  return {
    parse(args: string[]): TArgs<T> {
      const command = args[0]
      args = args.slice(1)
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
        return (nameOrAlias in config
          ? nameOrAlias
          : aliases[nameOrAlias]) || nameOrAlias
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

      function getNextPositional(argument: string): string {
        const p = positional.shift()
        assert(!!p, 'Unknown positional argument: ' + argument)
        return p!
      }

      let onlyPositionals = false
      while (it.hasNext()) {
        const argument = it.next()
        if (argument === '--' && !onlyPositionals) {
          onlyPositionals = true
          continue
        }
        const isPositional = argument.substring(0, 1) !== '-' || onlyPositionals
        if (isPositional) {
          onlyPositionals = true
        }
        const argName = !isPositional
          ? processFlags(argument)
          : getNextPositional(argument)
        const argConfig = config[argName]
        if (!isPositional && argName === 'help') {
          log(help(command, config, description))
          exit()
          // should never reach this in real life
          return null as any
        }
        assert(!!argConfig, 'Unknown argument: ' + argument)
        delete requiredArgs[argName]
        switch (argConfig.type) {
          case 'string':
            result[argName] = getValue(it, argument, isPositional)
            assert(!!result[argName],
              'Value of argument must be a string: ' + argument)
            break
          case 'string[]':
            result[argName] = extractArray(
              it, argument, isPositional, argConfig.n)
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
