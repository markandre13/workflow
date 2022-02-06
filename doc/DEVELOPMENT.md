# Development

## Toolchain

* [Pure ESM Module](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) toolchain
* [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) for test execution 

  Run's ESM files in a browser using [Mocha](https://mochajs.org))

* [Web Test Server](https://modern-web.dev/docs/dev-server/overview/) for running the application during development

  Serves ESM files and provides Hot Module Reload (HMR)

* [TypeScript](https://www.typescriptlang.org) for catching obvious errors at compile time.

  When run with --watch, usually compiles within less than a second, putting it
  en par with [swc](https://swc.rs) and [esbuild](https://esbuild.github.io) in regards
  to performance while also providing newest language features. (E.g. 'override')

* [ttypescript](https://www.npmjs.com/package/ttypescript) to compile directly to ESM

* [rollup.js](https://rollupjs.org/) for production bundling

I usually run all tools in watch mode for best performance. Each of them in a separate terminal window.

## Coding
```
     npm run dev:compiler
     npm run dev:server
```

## Testing
```
    npm run dev:compiler
    npm run test:server
```

or when focusing on a certain feature

```
    npm run dev:compiler
    npm run test:server --file=build/test/unit/pentool.spec.js
```

As workflow is developed along with toad.js and corba.js, I sometimes use them via `npm link toad.js corba.js` and also compile them with `npm run dev:compiler`, which will _instantly_ reflect in `dev:server` and `test:server`.

## Caveats

Well, reacting _instantly_ on changes sometimes takes a few seconds for `@web/*` to reload while `tcs` really reacts instantly.

`@web/test-runner` sometimes also hangs for several minutes and cannot be stopped with Ctrl+C.

It would also be nice being able to run `ttsc`, `@web/dev-server` and `@web/test-runner` in a single terminal. But the way they print to the console doesn't make this feasible.