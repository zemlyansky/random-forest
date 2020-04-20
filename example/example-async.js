const { RandomForestClassifier } = require('../async.js')

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

;(async function f () {
  console.time('Time async')
  const rf = new RandomForestClassifier({
    maxDepth: 8,
    nEstimators: 10,
    nJobs: 4
  })
  await rf.init()
  await rf.train(Xtrain, ytrain)
  const ypred = await rf.predict(Xtest)
  console.log(ypred, ytest)
  console.timeEnd('Time async')
})()
