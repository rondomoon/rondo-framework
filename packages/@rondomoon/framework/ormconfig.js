const config = require('config')
module.exports = JSON.parse(JSON.stringify(config.get('app.db')))
