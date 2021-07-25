# Random Forest (JavaScript + WebAssembly)

This package includes a WebAssebly port of the native C++ package [RandomForests](https://github.com/handspeaker/RandomForests) wrapped in a JavaScript API. It works in most modern browsers and Node.js. There's experimental support of async computation and multithreading in the browsers, using WebWorkers. Unfortunately, no tests yet. You can find examples in the `example` folder.

* Supports regression and classification tasks
* Faster than existing JS implementations
* Supports sync and async modes
* Permutation feature importance
* Threads (WebWorkers)
* CommonJS module

## Why Random Forests
Compared to R, Python, or Julia, the JavaScript ecosystem doesn't have many machine learning packages. Of course, there's Tensorflow.js, but sometimes neural nets are not such a good option (e.g., small tabular data). Random forest is a robust ensemble method that fits multiple decision trees under the hood using different subsets of original data. The algorithm has a pretty simple nature but is very powerful, catching non-linear dependencies between variables. It's also ideal for parallelization and implementation in a native language, such as C or C++. Luckily, WebAssembly makes it possible to take an efficient and fast native lib and port it to browsers and Node.js.

## Install
```
npm install -S random-forest
```

## Sync mode

### Init
```javascript
const { RandomForestClassifier, RandomForestRegressor } = require('random-forest')

const rf = new RandomForestClassifier({
  nEstimators: 100,
  maxDepth: 10,
  maxFeatures: 'auto',
  minSamplesLeaf: 5,
  minInfoGain: 0,
})
``` 

### Training, Predicting
```javascript
rf.train(Xtrain, ytrain)
const ypred = rf.predict(Xtest)
```

### Saving, Loading models
```javascript
const model = rf.save()
fs.writeFileSync('example.model', model)
const modelLoaded = new Uint8Array(fs.readFileSync('example.model'))
rf.load(modelLoaded)
const ypred = rf.predict(Xtest)
```

Some browsers doesn't allow running WebAssembly in a sync mode.
In such case, you can try async mode described below.

## Async mode
```javascript
const { RandomForestClassifier, RandomForestRegressor } = require('random-forest/async')

// ! Don't miss /async part in require('random-forest/async') !

;(async function f () {
  const rf = new RandomForestClassifier({
    nEstimators: 100,
    maxDepth: 10,
    maxFeatures: 'auto',
    minSamplesLeaf: 5,
    minInfoGain: 0,
    nJobs: 4 // Control the number of threads (workers) with this param
  })
  await rf.init()
  await rf.train(Xtrain, ytrain)
  const ypred = await rf.predict(Xtest)
  console.log(ypred, ytest)
})()
```

Currently the `async` mode doesn't support loading/saving models.

## Development

Contributions are very welcomed. Some insights on how everything works:

**Building steps:**
1. The native code is loaded from the [native-forest](https://github.com/zemlyansky/native-forest) repo, a fork from [RandomForests](https://github.com/handspeaker/RandomForests), a C++ implementation of random forests
2. Custom C++ interfaces are in `src/api.cpp` and `src/api.h`.
3. Emscripten compiles the `native-forest` code with defined interfaces into `native/native.js` and `native/native.wasm`. Compilation settings located in `Makefile`
4. To load WebAssembly in sync mode, `prepare-wasm.js` script converts the wasm file into a Uint8 array and stores it in the `wrappers` folder
5. Then `src/base.js` loads `wrapper/native.bin.js` as a regular CommonJS module, initializes it using the `native/native.js` module utils and then inititalizes native functions with `cwrap`
6. That's all what needed for the sync mode to work. Now prepare `async` version. To make it easier loading and bundling the module, a WebWorker script is bundled, rather than uses importScript. It's also loaded not as a separate file, but Blob. To generate the Blob we need the worker to be compiled first, then loaded as a string
7. Bundle `src/worker.js` into `dist/worker.js`
8. Use `prepare-worker.js` to read code of `dist/worker.js` and save it as a module in `wrapper/worker.code.js`
9. Load wrapped code in `src/async.js`, init Blob, the URL, and WebWorkers
10. In async mode results are aggregates
