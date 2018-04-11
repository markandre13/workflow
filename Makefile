.PHONY: all dist devel

all:
	@echo "Available targets are 'dist' and 'devel'"

dist:
	npm install
	npm run build

devel:
	npm link toad.js
	npm install
	npm run build
