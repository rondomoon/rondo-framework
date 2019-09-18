const {ConfigReader} = require('@rondo.dev/config')
const config = new ConfigReader(__dirname).read()
module.exports = JSON.parse(JSON.stringify(config.get('app.db')))
