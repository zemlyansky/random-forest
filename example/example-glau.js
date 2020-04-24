const fs = require('fs')
const parse = require('csv-parse/lib/sync')
const { RandomForest, RandomForestClassifier, RandomForestRegressor } = require('../index.js')

const file = fs.readFileSync('./friedman1.csv', 'utf8')
const records = parse(file, {
  columns: false,
  skip_empty_lines: true
})

const features = records.shift().slice(1, -1)
const X = records.map(r => r.slice(1, -1))
const yraw = records.map(r => +(r[r.length - 1] > 15))
const classes = Array.from(new Set(yraw))
// const y = yraw.map(v => classes.indexOf(v) + Math.random() / 4)
// const y = yraw.map(v => classes.indexOf(v))
const y = yraw
// console.log('Y', y, classes)

const split = Math.round(0.7 * y.length)

const Xtrain = X.filter((_, i) => i < split)
const ytrain = y.filter((_, i) => i < split)
const Xtest = X.filter((_, i) => i >= split)
const ytest = y.filter((_, i) => i >= split)

//console.log('Ytrain', ytrain)
//console.log('Ytest', ytest)

// const rf = new RandomForestClassifier({
const rf = new RandomForest({
  maxDepth: 20,
  nEstimators: 100
})

rf.train(Xtrain, ytrain)
const ypred = rf.predict(Xtest)
const yprob = rf.predictProba(Xtest)

ypred.forEach((v, i) => {
  if (i < 25) console.log('Pred', i, v, yprob[i], ytest[i])
})

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


