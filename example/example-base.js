// const fs = require('fs')
const { RandomForestClassifier } = require('../index.js')

function generateData (nSamples, nFeatures) {
  const X = []
  const y = []
  for (let i = 0; i < nSamples; i++) {
    const x = []
    for (let j = 0; j < nFeatures; j++) {
      x.push(Math.random())
    }
    X.push(x)
    y.push(+(x.reduce((a, v) => a + v) / nFeatures > x[0] * x[0]))
  }
  return [X, y]
}

const nTrainSamples = 10000
const nTrainFeatures = 10
const [Xtrain, ytrain] = generateData(nTrainSamples, nTrainFeatures)

const nTestSamples = 100
const nTestFeatures = 30
const [Xtest, ytest] = generateData(nTestSamples, nTestFeatures)

console.time('Time sync')
const rf = new RandomForestClassifier({
  maxDepth: 8,
  nEstimators: 40
})
rf.train(Xtrain, ytrain)
const ypred = rf.predict(Xtest)
console.log(ypred, ytest)
console.timeEnd('Time sync')

/*
const model = rf.save()
fs.writeFileSync('example.model', model)
const modelLoaded = new Uint8Array(fs.readFileSync('example.model'))
rf.load(modelLoaded)
const ypred = rf.predict(Xtest)
console.log('Results', ypred)
*/
