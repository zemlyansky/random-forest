const RandomForestAsync = require('./src/async.js')

class RandomForestClassifier extends RandomForestAsync {
  constructor (opts) {
    opts.type = 'classification'
    super(opts)
  }
}

class RandomForestRegressor extends RandomForestAsync {
  constructor (opts) {
    opts.type = 'regression'
    super(opts)
  }
}

module.exports = {
  RandomForest: RandomForestAsync,
  RandomForestClassifier,
  RandomForestRegressor
}
