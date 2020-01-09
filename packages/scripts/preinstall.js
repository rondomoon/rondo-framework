const fs = require('fs')

if (!fs.existsSync('lib')) {
  fs.mkdirSync('lib')
}

if (!fs.existsSync('lib/index.js')) {
  fs.writeFileSync('lib/index.js', '')
}
