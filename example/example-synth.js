const { RandomForest, RandomForestClassifier, RandomForestRegressor } = require('../index.js')
const make = require('mkdata')

const [Xtrain, ytrain] = make.friedman1({ nSamples: 1000 })
const [Xtest, ytest] = make.friedman1({ nSamples: 600 })

console.log(Xtrain.slice(0, 5), ytrain.slice(0, 5))

const rf = new RandomForest({
  maxDepth: 22,
  nEstimators: 500
})

setTimeout(() => {
rf.train(Xtrain, ytrain)
const ypred = rf.predict(Xtest)
// const yprob = rf.predictProba(Xtest)

console.log(rf)

ypred.forEach((v, i) => {
  if (i < 15) console.log('Pred', i, v, ytest[i])
})

process.exit()

// console.log('Prediction:', ypred.slice(0, 100), ytest.slice(0, 100), yprob.slice(0, 100))
// console.log('PREDICT TRAIN:', rf.predict(Xtrain), ytrain)
// console.log('PREDICT TEST:', rf.predict(Xtest), ytest)
// console.log('PREDICT TEST PROBS:', rf.predictProba(Xtest).slice(0, 3), ytest.slice(0, 3))
const opts = { n: 3, means: true, verbose: true, kind: 'ce'}
const imps = rf.getFeatureImportances(Xtest, ytest, opts)
const res = {}
imps.forEach((m, i) => res[features[i]] = m)
console.log(res)
process.exit()
}, 1000)


