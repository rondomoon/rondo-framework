const {ConfigReader} = require('@rondo.dev/server')
const config = new ConfigReader(__dirname).read()
module.exports = JSON.parse(JSON.stringify(config.get('app.db')))
