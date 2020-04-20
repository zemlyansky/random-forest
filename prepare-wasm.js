// Loads bundled base forest module and wraps its content into module.exports
var fs = require('fs')
var file = fs.readFileSync('./wasm/native.wasm')
fs.writeFileSync('./wrapper/native.bin.js', 'module.exports = ' + JSON.stringify(file))
