const importance = require('importance')
const Module = require('../wasm/native.js')
const { uintify, calculateMaxFeatures, detectType, Encoder, normalizeProbs } = require('./util.js')

const bin = require('../wrapper/native.bin.js')
const m = Module({ wasmBinary: bin.data })

const _create = m.cwrap('create', 'number', ['number', 'number', 'number', 'number'])
const _train = m.cwrap('train', 'number', ['number', 'array', 'array', 'number', 'number', 'number', 'boolean', 'number', 'number'])
const _predict = m.cwrap('predict', 'number', ['number', 'array'])
const _predictProba = m.cwrap('predictProba', 'array', ['number', 'array', 'number'])
const _save = m.cwrap('save', null, ['number'])
const _load = m.cwrap('load', null, ['number'])

const defaults = {
  nEstimators: 100,
  maxDepth: 10,
  maxFeatures: 'auto',
  minSamplesLeaf: 5,
  minInfoGain: 0
}

module.exports = class RandomForestBase {
  constructor (opts = {}) {
    const options = Object.assign({}, defaults, opts)
    if (options.maxDepth > 20) {
      throw new Error('maxDepth should be <=20')
    }
    for (const k in options) {
      this[k] = options[k]
    }
    this.model = _create(options.nEstimators, options.maxDepth, options.minSamplesLeaf, options.minInfoGain)
  }

  train (X, y) {
    this.type = (typeof this.type === 'string') && (this.type !== 'auto') ? this.type : detectType(y)
    this.Xencoder = new Encoder()
    this.yencoder = new Encoder()
    X = this.Xencoder.fitTransform(X, this.categorical)
    y = this.yencoder.fitTransform(y).flat()
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
      throw new Error('X should be array, try [value]')
    } else if (Array.isArray(X) && !Array.isArray(X[0])) {
      X = this.Xencoder.transform([X])[0]
      return this.yencoder.inverseTransform([_predict(this.model, uintify(X))])[0]
    } else {
      X = this.Xencoder.transform(X)
      return this.yencoder.inverseTransform(X.map(x => _predict(this.model, uintify(x))))
    }
  }

  predictProba (X) {
    if (typeof X === 'number') {
      throw new Error('X should be array, try [value]')
    } else if (Array.isArray(X) && !Array.isArray(X[0])) {
      X = this.Xencoder.transform([X])[0]
      const addr = _predictProba(this.model, uintify(X.flat()), this.nClasses)
      const data = []
      for (let i = 0; i < this.nClasses; i++) {
        data.push(m.HEAPF32[addr / Float32Array.BYTES_PER_ELEMENT + i])
      }
      return normalizeProbs(data)
    } else {
      return X.map(x => this.predictProba(x))
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

  getFeatureImportances (X, y, opts = {}) {
    // No need to transform X here because importance does this when calling model.predict()
    if (this.nSamples) {
      if (opts.kind === 'ce' || (this.type === 'classification' && !opts.kind)) {
        y = this.yencoder.transform(y).flat()
        opts.kind = 'ce'
      } else if (this.type === 'regression' && !opts.kind) {
        opts.kind = 'mae'
      }
      return importance(this, X, y, opts)
    } else {
      throw new Error('Train the model first')
    }
  }
}
