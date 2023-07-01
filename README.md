# ✨ [`magic-comments`](https://www.npmjs.com/package/magic-comments)

![CI](https://github.com/morganney/magic-comments/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/magic-comments/branch/main/graph/badge.svg?token=5O23HMHBKG)](https://codecov.io/gh/morganney/magic-comments)

Tooling utility to add configurable webpack [magic comments](https://webpack.js.org/api/module-methods/#magic-comments) to dynamic `import()` expressions at build time.

Useful when working with:

* [Babel plugins](https://babeljs.io/docs/plugins)
* [Webpack loaders](https://webpack.js.org/loaders/)
* [Vite plugins](https://vitejs.dev/guide/api-plugin.html)
* Anywhere you want to add magic comments to your source code before running through webpack.

## Getting Started

First install `magic-comments`:

```
npm install magic-comments
```

Next generate an AST or RegExp that provides the following information for each file processed:

* The absolute filename of the file being processed (`modulePath`).
* The import specifier used in the dynamic imports found (`importPath`).

Then pass that information along to `magic-comments` to generate a magic comment that can be inserted into an `import()` expression:

**src/file.js**

```js
const mod = import('./folder/module.js')
```

**tooling**
```js
import { getMagicComment } from 'magic-comments'

const modulePath = resolve(directory, './src/file.js')
const code = fs.readFileSync(modulePath)
const ast = parse(code)
const dynamicImportsMeta = getDynamicImportMetaFrom(ast)

dynamicImportsMeta.forEach(meta) => {
  const magicComment = getMagicComment({
    modulePath,
    importPath: meta.importPath,
    options: {
      webpackChunkName: true,
      webpackFetchPriority: "high"
    }
  })
  
  // prints /* webpackChunkName: "folder-module", webpackFetchPriority: "high" */
  console.log(magicComment)
})
```
