#!/usr/bin/env node
const filename = process.argv[2]
const fs = require('fs')
const unpack = require('browser-unpack')
const path = require('path')

const file = fs.readFileSync(filename, 'utf8')
const result = unpack(file)

const sizes = result.map(item => {
  const size = new Buffer(item.source).byteLength
  const sizeKb = (size / 1024).toFixed(3) + ' kb'
  return {
    id: path.relative(process.cwd(), item.id),
    size,
    sizeKb,
  }
})
.sort((a, b) => a.size - b.size)

const maxNameLength = sizes
.reduce((m, i) => m < i.id.length ? i.id.length : m, 0)
const maxSizeLength = sizes
.reduce((m, i) => m < i.sizeKb.length ? i.sizeKb.length : m, 0)

const totalSize = sizes.reduce((s, i) => i.size + s, 0)

function padRight(text, size) {
  while (text.length < size) {
    text += ' '
  }
  return text
}

function padLeft(text, size) {
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
