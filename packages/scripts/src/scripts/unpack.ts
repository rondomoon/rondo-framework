import * as fs from 'fs'
import _unpack from 'browser-unpack'
import * as path from 'path'
import { argparse, arg } from '@rondo.dev/argparse'

export async function unpack(...argv: string[]) {
  const args = argparse({
    filename: arg('string', {positional: true, required: true}),
    help: arg('boolean'),
  }).parse(argv)

  const file = fs.readFileSync(args.filename, 'utf8')
  const result = _unpack(file)

  const sizes = result.map(item => {
    const size = new Buffer(item.source).byteLength
    const sizeKb = (size / 1024).toFixed(3) + ' kb'
    return {
      id: path.relative(process.cwd(), item.id.toString()),
      size,
      sizeKb,
      deps: item.deps,
    }
  })
  .sort((a, b) => a.size - b.size)

  const maxNameLength = sizes
  .reduce((m, i) => m < i.id.length ? i.id.length : m, 0)
  const maxSizeLength = sizes
  .reduce((m, i) => m < i.sizeKb.length ? i.sizeKb.length : m, 0)

  const totalSize = sizes.reduce((s, i) => i.size + s, 0)

  function padRight(text: string, size: number) {
    while (text.length < size) {
      text += ' '
    }
    return text
  }

  function padLeft(text: string, size: number) {
    while (text.length < size) {
      text = ' ' + text
    }
    return text
  }

  sizes
  .forEach(item => {
    console.log(
      padRight(item.id, maxNameLength),
      padLeft(item.sizeKb, maxSizeLength),
    )
  })
  console.log()
  console.log(
    padRight('Total size:', maxNameLength),
    padLeft((totalSize / 1024).toFixed(3) + ' kb', maxSizeLength),
  )
}

export async function unpackInverseDeps(...argv: string[]) {
  const args = argparse({
    filename: arg('string', {positional: true, required: true}),
    help: arg('boolean'),
  }).parse(argv)

  const file = fs.readFileSync(args.filename, 'utf8')
  const result = _unpack(file)

  const cwd = process.cwd()
  const depsById = result.reduce((obj, item) => {
    const id = path.relative(cwd, item.id.toString())
    Object.keys(item.deps).forEach(dep => {
      const depId = path.relative(cwd, item.deps[dep].toString())
      obj[depId] = obj[depId] || []
      obj[depId].push(id)
    })
    return obj
  }, {} as Record<string, string[]>)

  Object.keys(depsById).forEach(dep => {
    console.log(dep)
    const deps = depsById[dep]
    if (deps) {
      deps.forEach(value => {
        console.log('  -', value)
      })
    }
    console.log('')
  })
}
