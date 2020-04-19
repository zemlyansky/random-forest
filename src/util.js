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

module.exports = {
  uintify,
  accuracy,
  calculateMaxFeatures
}
