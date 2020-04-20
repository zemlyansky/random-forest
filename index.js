const RandomForestBase = require('./src/base.js')

class RandomForestClassifier extends RandomForestBase {
  constructor (opts) {
    opts.type = 'classification'
    super(opts)
  }
}

class RandomForestRegressor extends RandomForestBase {
  constructor (opts) {
    opts.type = 'regression'
    super(opts)
  }
}

module.exports = {
  RandomForest: RandomForestBase,
  RandomForestClassifier,
  RandomForestRegressor
}
