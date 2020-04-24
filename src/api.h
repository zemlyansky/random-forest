#ifndef API_H_
#define API_H_

#include "../native/RandomForest.h"

#ifdef __cplusplus
extern "C" {
#endif

RandomForest* create (int nEstimators, int maxDepth, int minSamplesLeaf, int minInfoGain);
void train (RandomForest* forest, float* X, float* y, int nSamples, int nFeatures, int nClasses, bool isRegression, int maxFeatures, int seed);
float predict (RandomForest* forest, float* X);
float* predictProba (RandomForest* forest, float* X, int nFeatures);
void save (RandomForest* forest);
void load (RandomForest* forest);

#ifdef __cplusplus
}
#endif

#endif
