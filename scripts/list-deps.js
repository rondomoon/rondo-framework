#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function getDependencies(root) {
  const files = [path.resolve(root)]

  const used = new Set()
  const deps = []

  while (files.length) {
    const file = files.pop()
    const contents = fs.readFileSync(file, 'utf8')
    const match  = contents.match(/require\(".*?"\)/g)
    console.log(file, match)
    if (!match) {
      continue
    }
    match
    .map(m => m.substring('require("'.length, m.length - 2))
    .map(dep => {
      if (dep.startsWith('.')) {
        return {
          file: require.resolve(path.resolve(path.dirname(file), dep)),
          isDep: false,
        }
      }
      if (dep.startsWith('@rondo/')) {
        return {
          file: require.resolve(dep),
          isDep: false
        }
      }
      return {
        file: dep,
        isDep: true,
      }
    })
    .filter(dep => !used.has(dep.file))
    .forEach(dep => {
      used.add(dep.file)
      if (dep.isDep) {
        if (require.resolve.paths(dep.file) !== null) {
          // skip core modules
          deps.push(dep.file)
        }
        return
      }
      files.push(dep.file)
    })

  }

  return deps
}

console.log(getDependencies(process.argv[2]))
