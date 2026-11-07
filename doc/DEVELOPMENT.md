# Development

## Toolchain

* [Vite](https://vite.dev/) for the development server and production builds

  Vite uses Rolldown and Oxc, so TypeScript and TSX are transpiled without a
  separate build step. The development server provides Hot Module Replacement.

* [Vitest](https://vitest.dev/) for test execution

  The unit tests run in a real browser (Chromium via Playwright) because they
  depend on DOM, SVG and IndexedDB APIs. Vitest is configured in browser mode
  in `vitest.config.mts`.

* [TypeScript](https://www.typescriptlang.org) for catching obvious errors at
  compile time.

* [corba.js](https://www.npmjs.com/package/corba.js) to generate the CORBA
  stubs and value types from `src/shared/workflow.idl`.

* [toad.js](https://www.npmjs.com/package/toad.js) and
  [toad.jsx](https://www.npmjs.com/package/toad.jsx) for the UI.

## Coding

```
    npm run dev
```

This generates the CORBA sources and starts the Vite development server at the
URL printed in the terminal. `index-dev.html` loads `src/client/main.ts`
directly, so changes are reflected without rebuilding the application.

## Testing

```
    npm test
```

runs the complete unit test suite once. During development use

```
    npm run test:watch
```

to run Vitest in watch mode. A single file can be selected with

```
    npm run test --file test/unit/figuretools/pentool.spec.ts
```

To watch the tests in a visible browser, run

```
    npx vitest --browser.headless=false
```

## Production Build

```
    npm run build
```

This generates the CORBA sources, bundles the client into `dist/` and emits the
server as `dist/server.js`.

## Type Checking

```
    npm run typecheck
```

As workflow is developed along with toad.js and corba.js, I sometimes use them
via `npm link toad.js toad.jsx corba.js`; Vite and Vitest will pick up the linked
packages immediately.
