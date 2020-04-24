# vim: set noet:
CC = emcc
CXX = em++

EXPORTED_FUNCTIONS="['_create', '_train', '_predict', '_predictProba', '_save', '_load']"

CFLAGS = -O3 -Wall -fPIC --memory-init-file 0 -std=c++11 
EMCFLAGS = -s ALLOW_MEMORY_GROWTH=1 -s FORCE_FILESYSTEM=1 -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "FS_readFile", "FS_writeFile"]' -s MODULARIZE=1 -s BINARYEN_ASYNC_COMPILATION=0

FILES = native/RandomForest.cpp
FILES += native/Sample.cpp
FILES += native/Tree.cpp
FILES += native/Node.cpp

build: clean
	mkdir wasm;
	${CXX} ${CFLAGS} ${EMCFLAGS} ${FILES} src/api.cpp -o wasm/native.js;

clean:
	rm -rf wasm;
