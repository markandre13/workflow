SRC=$(shell find src -name "[a-zA-Z]*.ts")

all: node_modules bundle.js

bundle.js: $(SRC)
	node_modules/.bin/browserify \
	  --debug \
	  --standalone workflow \
	  src/client.ts \
	  -p \[ tsify --strict --noImplicitAny --noImplicitReturns --noImplicitThis --target ES2015 \] \
	  -o bundle.js
