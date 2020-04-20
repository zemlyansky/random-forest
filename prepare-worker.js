// Loads bundled base forest module and wraps its content into module.exports
var fs = require('fs')
var file = fs.readFileSync('./dist/worker.js', 'utf8')
fs.writeFileSync('./wrapper/worker.code.js', 'module.exports = "' + JSON.stringify(file).slice(1, -1) + '"')
