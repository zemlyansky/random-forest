// const workerThreads = require('worker_threads')
// const { Worker, isMainThread, parentPort } = workerThreads
// const threads = require('bthreads')
// const threads = require('bthreads/process')
// const RandomForestBase = require('./base.js')
// const W = (typeof this.Worker === 'undefined') ? Worker : this.Worker
const fs = require('fs')
const path = require('path')
const workertxt = fs.readFileSync(path.resolve(__dirname, '../dist/worker.js'), 'utf8')

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
    const blob = new window.Blob([workertxt], { type: 'text/javascript' })
    this.workers = []
    const initPromises = []
    for (let i = 0; i < this.nJobs; i++) {
      const promise = new Promise((resolve, reject) => {
        console.log('INIT WORKER')
        const worker = new window.Worker(window.URL.createObjectURL(blob))
        this.workers.push(worker)
        worker.postMessage(this._opts)
        worker.onmessage = (msg) => {
          resolve()
        }
        // worker.onMessage = (msg) => {
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
    return Promise.all(predictPromises).then(msg => {
      const result = []
      for (let i = 0; i < msg[0].length; i++) {
        let avg = 0
        for (let j = 0; j < this.nJobs; j++) {
          avg += msg[j][i] / this.nJobs
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
/*
} else {
  console.log('Worker here')
  let forest
  function processMessage (msg) {
    if ((typeof msg === 'object') && msg.type) {
      forest = new RandomForestBase(msg)
      threads.parentPort.postMessage('')
    } else if (Array.isArray(msg) && Array.isArray(msg[0]) && (msg.length === 2)) {
      forest.train(msg[0], msg[1])
      threads.parentPort.postMessage('')
    } else if (Array.isArray(msg)) {
      const ypred = forest.predict(msg)
      threads.parentPort.postMessage(ypred)
    }
  }
  threads.parentPort.on('message', processMessage)
}
*/
