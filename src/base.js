const Module = require('../wasm/native.js')
const { uintify, calculateMaxFeatures } = require('./util.js')

const fs = require('fs')
const path = require('path')
const bin = fs.readFileSync(path.resolve(__dirname, '../wasm/native.wasm'))
const m = Module({ wasmBinary: bin })

const _create = m.cwrap('create', 'number', ['number', 'number', 'number', 'number'])
const _train = m.cwrap('train', 'number', ['number', 'array', 'array', 'number', 'number', 'number', 'boolean', 'number', 'number'])
const _predict = m.cwrap('predict', 'number', ['number', 'array'])
const _save = m.cwrap('save', null, ['number'])
const _load = m.cwrap('load', null, ['number'])

const defaults = {
  type: 'classification',
  nEstimators: 100,
  maxDepth: 10,
  maxFeatures: 'auto',
  minSamplesLeaf: 5,
  minInfoGain: 0
}

module.exports = class RandomForestBase {
  constructor (opts = {}) {
    const options = Object.assign({}, defaults, opts)
    for (const k in options) {
      this[k] = options[k]
    }
    this.model = _create(options.nEstimators, options.maxDepth, options.minSamplesLeaf, options.minInfoGain)
  }

  train (X, y) {
    this.nSamples = X.length
    this.nFeatures = X[0].length
    this.nClasses = (this.type === 'regression') ? 1 : Array.from(new Set(y)).length
    const Xuint = uintify(X.flat())
    const yuint = uintify(y)
    _train(
      this.model,
      Xuint,
      yuint,
      this.nSamples,
      this.nFeatures,
      this.nClasses,
      this.type === 'regression',
      calculateMaxFeatures(this.maxFeatures, this.nFeatures),
      this.seed || Math.round(Math.random() * 1000000) // RF native see the same time in different workers. Need to help him
    )
  }

  predict (X) {
    if (typeof X === 'number') {
      return _predict(this.model, uintify([X]))
    } else if (!Array.isArray(X[0])) {
      return _predict(this.model, uintify(X))
    } else {
      return X.map(x => _predict(this.model, uintify(x)))
    }
  }

  save () {
    _save(this.model)
    const model = m.FS_readFile('model.txt')
    return model
  }

  load (model) {
    m.FS_writeFile('model.txt', model)
    _load(this.model)
  }
}
