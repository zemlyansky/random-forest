function uintify (arr) {
  return new Uint8Array(Float32Array.from(arr).buffer)
}

function calculateMaxFeatures (param, nFeatures) {
  if (param === 'auto' || param === 'sqrt') {
    return Math.round(Math.sqrt(nFeatures))
  } else if (param === 'log2') {
    return Math.round(Math.log2(nFeatures))
  } else if (Math.round(param) === param) {
    return param
  } else if (param < 1) {
    return Math.round(param * nFeatures)
  } else {
    return nFeatures
  }
}

function accuracy (ypred, ytest) {
  const nSamples = ypred.length
  return ypred.reduce((acc, y, i) => acc + (y === ytest[i]), 0) / nSamples
}

function normalizeProbs (probs) {
  const sum = probs.reduce((a, v) => a + v, 0)
  if (sum > 0) return probs.map(v => v / sum)
  else return probs.map(v => 1 / probs.length)
}

function detectType (y) {
  if (y.some(v => isNaN(v))) {
    return 'classification'
  } else {
    const nUnique = Array.from(new Set(y)).length
    if ((nUnique / y.length) < 0.2 && nUnique < 20) {
      return 'classification'
    } else {
      return 'regression'
    }
  }
}

class Encoder {
  constructor (type = 'label') {
    this.type = type
    this.uniques = []
  }

  fitTransform (X, categorical) {
    X = Array.isArray(X[0]) ? X : X.map(x => [x])
    const data = X.map(x => x.slice(0))
    for (let i = 0; i < data[0].length; i++) {
      const col = data.map(d => d[i])
      const colType = categorical
        ? (categorical[i] ? 'classification' : 'regression')
        : detectType(col)
      if (colType === 'classification') {
        const unique = Array.from(new Set(col))
        this.uniques.push(unique)
        col.forEach((v, rowIndex) => {
          data[rowIndex][i] = unique.indexOf(v)
        })
      } else {
        col.forEach((v, rowIndex) => {
          data[rowIndex][i] = parseFloat(v)
        })
        this.uniques.push(null)
      }
    }
    return data
  }

  transform (X) {
    X = Array.isArray(X[0]) ? X : X.map(x => [x])
    const data = X.map(x => x.slice(0))
    for (let i = 0; i < data[0].length; i++) {
      const col = data.map(d => d[i])
      const unique = this.uniques[i]
      if (Array.isArray(unique)) {
        col.forEach((v, rowIndex) => {
          data[rowIndex][i] = unique.indexOf(v)
        })
      } else {
        col.forEach((v, rowIndex) => {
          data[rowIndex][i] = parseFloat(v)
        })
      }
    }
    return data
  }

  inverseTransform (y) {
    const unique = this.uniques[this.uniques.length - 1]
    if (Array.isArray(unique)) {
      return y.map((v, i) => unique[v])
    } else {
      return y
    }
  }
}

module.exports = {
  uintify,
  accuracy,
  calculateMaxFeatures,
  detectType,
  Encoder,
  normalizeProbs
}
