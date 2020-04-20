// TODO: Implement Node workers:
// const workerThreads = require('worker_threads')
// const threads = require('bthreads')
// or some other multithreading..

const code = require('../wrapper/worker.code.js')

const defaultsAsync = {
  type: 'classification',
  nJobs: 4,
  nEstimators: 100,
  maxDepth: 10,
  maxFeatures: 'auto',
  minSamplesLeaf: 5,
  minInfoGain: 0
}

function genPromises (workers, msg) {
  return workers.map(worker => new Promise((resolve, reject) => {
    worker.postMessage(msg)
    worker.onmessage = (m) => {
      resolve(m)
    }
  }))
}

module.exports = class RandomForestAsync {
  constructor (opts) {
    const options = Object.assign({}, defaultsAsync, opts)
    for (const k in options) {
      this[k] = options[k]
    }
    this._opts = options
    this._opts.nEstimators = Math.round(options.nEstimators / options.nJobs)
  }

  init () {
    const blob = new window.Blob([code], { type: 'text/javascript' })
    this.workers = []
    const initPromises = []
    for (let i = 0; i < this.nJobs; i++) {
      const promise = new Promise((resolve, reject) => {
        const worker = new window.Worker(window.URL.createObjectURL(blob))
        this.workers.push(worker)
        worker.postMessage(this._opts)
        worker.onmessage = (msg) => {
          resolve()
        }
      })
      initPromises.push(promise)
    }
    return Promise.all(initPromises)
  }

  train (X, y) {
    const trainPromises = genPromises(this.workers, [X, y])
    return Promise.all(trainPromises)
  }

  predict (X) {
    const predictPromises = genPromises(this.workers, X)
    return Promise.all(predictPromises).then(msgs => {
      const data = msgs.map(msg => msg.data)
      const result = []
      for (let i = 0; i < data[0].length; i++) {
        let avg = 0
        for (let j = 0; j < this.nJobs; j++) {
          avg += data[j][i] / this.nJobs
        }
        if (this.kind === 'classification') {
          avg = Math.round(avg)
        }
        result.push(avg)
      }
      return result
    })
  }
}
