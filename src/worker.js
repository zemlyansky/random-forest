const RandomForestBase = require('./base.js')

let forest

function processMessage (message) {
  const data = message.data
  if ((typeof data === 'object') && data.type) {
    forest = new RandomForestBase(data)
    postMessage('')
  } else if (Array.isArray(data) && Array.isArray(data[0]) && (data.length === 2)) {
    forest = new RandomForestBase(data)
    forest.train(data[0], data[1])
    postMessage('')
  } else if (Array.isArray(data)) {
    const ypred = forest.predict(data)
    postMessage(ypred)
  }
}

onmessage = processMessage
