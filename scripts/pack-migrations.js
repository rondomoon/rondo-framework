const fs = require('fs')
const path = require('path')

const dir = process.argv[2]

const index = fs.readdirSync(dir)
.filter(item => item.endsWith('.ts') && !item.endsWith('index.ts'))
.map(item => item.replace(/\.ts$/, ''))
.sort()
.map(item => `export * from './${item}'\n`)
.reduce((str, item) => str += item, '')

const out = path.join(dir, 'index.ts')
console.log('Writing to %s', out)
fs.writeFileSync(path.join(dir, 'index.ts'), index)
