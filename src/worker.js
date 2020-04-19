const RandomForestBase = require('./base.js')

let forest

function processMessage (msg) {
  if ((typeof msg === 'object') && msg.type) {
    forest = new RandomForestBase(msg)
    postMessage('')
  } else if (Array.isArray(msg) && Array.isArray(msg[0]) && (msg.length === 2)) {
    forest.train(msg[0], msg[1])
    postMessage('')
  } else if (Array.isArray(msg)) {
    const ypred = forest.predict(msg)
    postMessage(ypred)
  }
}

onmessage = processMessage
