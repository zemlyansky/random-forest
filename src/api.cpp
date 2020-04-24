// #include <vector>
// 
// #include <iostream>
// #include <fstream>
// #include <stdexcept>
// #include <string>
// #include <memory>
//


// #include "ranger/src/globals.h"
// #include "ranger/src/ForestClassification.h"
// #include "ranger/src/ForestRegression.h"
// #include "ranger/src/ForestSurvival.h"
// #include "ranger/src/ForestProbability.h"
// #include "ranger/src/utility.h"
// using namespace ranger;

/*
rf.predict(Xtest, nSamples, ypred);
float acc = 0;
for (int i = 0; i < nSamples; i++) {
  if (y[i] == ypred[i]) {
    acc += 1;
  }
}
RandomForest rf(100, 10, 10, 0);
*/

#include <stdio.h>
#include "api.h"
#include "../native/RandomForest.h"


float** convert (float* X, int nSamples, int nFeatures) {
  float** Xtrain = new float*[nSamples];
  for (int i = 0; i < nSamples; ++i) {
    float* x = new float[nFeatures];
    for (int j = 0; j < nFeatures; j++) {
      x[j] = X[i * nFeatures + j];
    }
    Xtrain[i] = x;
  }
  return Xtrain;
}

RandomForest* create (int nEstimators, int maxDepth, int minSamplesLeaf, int minInfoGain) {
  RandomForest* forest;
  forest = new RandomForest(nEstimators, maxDepth, minSamplesLeaf, minInfoGain);
  return forest;
}

void train (RandomForest* forest, float* X, float* y, int nSamples, int nFeatures, int nClasses, bool isRegression, int maxFeatures, int seed) {
  float** Xtrain = convert(X, nSamples, nFeatures);
  forest -> train(Xtrain, y, nSamples, nFeatures, nClasses, isRegression, maxFeatures, seed);
}

float predict (RandomForest* forest, float* X) {
  float ypred;
  forest -> predict(X, ypred, -1);
  return ypred;
}

float* predictProba (RandomForest* forest, float* X, int nClasses) {
  float* probs = new float[nClasses];
  for (int i = 0; i < nClasses; i++) {
    float ypred;
    forest -> predict(X, ypred, i);
    probs[i] = ypred;
  }
  return probs;
}

void save (RandomForest* forest) {
  forest -> saveModel("model.txt");
}

void load (RandomForest* forest) {
  forest -> readModel("model.txt");
}
