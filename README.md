# ✨ [`magic-comments`](https://www.npmjs.com/package/magic-comments)

![CI](https://github.com/morganney/magic-comments/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/morganney/magic-comments/branch/main/graph/badge.svg?token=5O23HMHBKG)](https://codecov.io/gh/morganney/magic-comments)
[![NPM version](https://img.shields.io/npm/v/magic-comments.svg)](https://www.npmjs.com/package/magic-comments)

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

Next, for each file processed provide the following **required** information for every `import()` found:

* The absolute filename of the file being processed (`modulePath`).
* The dynamic import's specifier (`importPath`).

Then pass those values to `getMagicComment()` to generate a magic comment that can be inserted into the corresponding `import()`:

**src/file.js**

```js
const mod = import('./folder/module.js')
```

**tooling**
```js
import { getMagicComment } from 'magic-comments'

const modulePath = resolve(cwd, './src/file.js')
const code = fs.readFileSync(modulePath)
const ast = parse(code)
const dynamicImports = traverseForImportSpecifiers(ast)

dynamicImports.forEach(({ importPath }) => {
  const magicComment = getMagicComment({
    modulePath,
    importPath,
    // The options are names of webpack magic comments
    options: {
      webpackChunkName: true,
      webpackFetchPriority: (modulePath, importPath) => {
        if (importPath.endsWith('module.js')) {
          return 'high'
        }
      }
    }
  })
  // /* webpackChunkName: "folder-module", webpackFetchPriority: "high" */
  console.log(magicComment)
})
```

## `getMagicComment()`

Generates a webpack magic comment.

```js
getMagicComment(ctx: MagicCommentsContext) => string
```

The only parameter is an object with the following properties.

```ts
interface MagicCommentsContext {
  importPath: string
  modulePath: string
  match?: 'module' | 'import'
  open?: boolean
  options?: MagicComments
}
```

### `MagicCommentsContext`

The only required properties are `modulePath` and `importPath`:

* [`modulePath`](#modulepath)
* [`importPath`](#importpath)
* [`open`](#open)
* [`match`](#match)
* [`options`](#options)

### `modulePath`

**required**<sup>*</sup>

The absolute path to the file with the dynamic imports.

### `importPath`

**required**<sup>*</sup>

The specifier from the dynamic import. For example, for `import('./specifier.js')` the `importPath` would be `./specifier.js`.

### `open`

**default** `false`

Whether the returned comment should surrounded by `/*` and `*/`, for example, `/* comment */` vs ``  comment  ``.

### `match`

**default** `'module'`

Sets how globs are matched, either the module file path, or the `import()` specifier.

### `options`

An object with properties corresponding to [magic comments supported by webpack](https://webpack.js.org/api/module-methods/#magic-comments). 

All options can be defined with a [`CommentFunc`](#commentfunc) or a [`CommentConfig`](#commentconfig) to support overrides of [`CommentOptions`](#commentoptions). Options that support globs use [`micromatch`](https://github.com/micromatch/micromatch) for pattern matching, where `type Glob = string | string[]`.

* [`webpackChunkName`](#webpackchunkname)
* [`webpackFetchPriority`](#webpackfetchpriority)
* [`webpackMode`](#webpackmode)
* [`webpackPrefetch`](#webpackprefetch)
* [`webpackPreload`](#webpackpreload)
* [`webpackInclude`](#webpackinclude)
* [`webpackExclude`](#webpackexclude)
* [`webpackExports`](#webpackexports)
* [`webpackIgnore`](#webpackignore)

#### `CommentFunc`

All options can be defined as a function to dynamically determine their value, or turn on and off.

```ts
interface CommentFunc<T> {
  (modulePath: string, importPath: string): T
}
```

The exact shape of `T` is determined by the magic comment the option is associated with, similar to `CommentOptions`.

#### `CommentConfig`

To allow overrides based on module or import paths, all options can be defined with an object having the following interface:

```ts
interface CommentConfig<T extends CommentOptions> {
  options: T
  overrides?: Array<{
    files: string | string[]
    options: T
  }>
}
```

#### `CommentOptions`

The exact shape defining `options` is determined by the magic comment it is associated with, but the interface always extends `CommentOptions`:

```ts
interface CommentOptions {
  active?: boolean | ((modulePath: string, importPath: string): boolean)
}
```

The `active` property turns the option on or off. Each particular magic comment extends this interface in their own way, adding additional properties relevant to their functioning.

For example, `webpackChunkName` adds a couple additional properties for adjusting the chunk name used:

```ts
interface WebpackChunkNameOptions extends CommentOptions {
  /**
   * Use the basename of the import specifier as the chunk name.
   */
  basename?: boolean
  /**
   * Provide a custom chunk name for all dynamic imports or
   * those matching a particular override glob.
   */
  name?: string
}
```

You can skip to the [overrides example](#overrides) to get a better sense of how this all works.


#### `webpackChunkName`

**type**

```ts
boolean
| Glob
| CommentFunc<string | false>
| CommentConfig<WebpackChunkNameOptions>
```

**default** `true`

Adds `webpackChunkName` magic comments. The assumption is that this is the most popular webpack magic comment, so **it will be enabled by default when `options` is empty of falsy**.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:

```ts
{
  // Use the basename of the import specifier as the chunk name.
  basename?: boolean
  // If overrides are not used, this will apply to ALL dynamic imports.
  name?: string
}
```

Possible values:
* `true` - Adds `webpackChunkName` comments to **all** dynamic imports using the derived path from the import specifier in kebab-case as the chunk name. This is the default.
* `false` - Disables adding the `webpackChunkName` comment globally.
* `string | string[]` - When the glob(s) match a path from a [`match`](#match) path, a `webpackChunkName` comment is added using the derived path from the import specifier in kebab-case as the chunk name.
* `(modulePath: string, importPath: string) => string | false` - Return a string to be used as the chunk name. Returning a falsy value will skip adding the comment.
* `options.basename`:
  * `true` - Use only the [basename](https://nodejs.org/api/path.html#pathbasenamepath-suffix) from the import specifier as the chunk name. Relative imports may result in name collisions. Use in areas where you know the basenames are unique.
  * `false` - Use the full derived path from the import specifier in kebab-case as the chunk name, same as the default behavior.
* `options.name`:
  * `string` - Set a fixed string to be used for all dynamic imports, or based on overrides.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackFetchPriority`

**type**

```ts
boolean
| FetchPriority
| CommentFunc<false | FetchPriority>
| CommentConfig<WebpackFetchPriorityOptions>
```

**default** None

Adds `webpackFetchPriority` magic comments.

`FetchPriority` is an enum:

```ts
enum FetchPriority {
  AUTO = 'auto',
  HIGH = 'high',
  LOW = 'low'
}
```

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:

```ts
{
  fetchPriority?: FetchPriority | CommentFunc<false | FetchPriority>
}
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackFetchPriority` magic comments to **all** dynamic imports with the default value of `'auto'`.
* `string` - Add `webpackFetchPriority` magic comments to **all** dynamic imports with the provided string value as the priority. If the string is not `'high'`, `'low'`, or `'auto'` the comment will **not** be added.
* `(modulePath: string, importPath: string) => FetchPriority | false` - Return a string to be used as the priority. Returning a falsy value or an unsupported string will **not** add the comment.
* `options.fetchPriority`:
  * `FetchPriority` - Sets the fetch priority to the provided value when adding the comment.
  * `(modulePath: string, importPath: string) => FetchPriority | false` - Same as using a function for the loader option.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackMode`

**type**

```ts
boolean
| Mode
| CommentFunc<false | Mode>
| CommentConfig<WebpackModeOptions>
```

**default** None

Adds `webpackMode` magic comments.

`Mode` is an enum:

```ts
enum Mode {
  LAZY = 'lazy',
  LAZY_ONCE = 'lazy-once',
  EAGER = 'eager',
  WEAK = 'weak'
}
```

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  mode?: Mode | CommentFunc<false | Mode>
}
```

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackMode` magic comments to **all** dynamic imports with the default value of `'lazy'`.
* `string` - Add `webpackMode` magic comments to **all** dynamic imports with the provided string value as the mode. If the string is not `'lazy'`, `'lazy-once'`, `'eager'`, or `'weak'` the comment will **not** be added.
* `(modulePath: string, importPath: string) => Mode | false` - Return a string to be used as the mode. Returning a falsy value or an unsupported string will **not** add the comment.
* `options.mode`:
  * `Mode` - Sets the chunk loading mode to the provided value when adding the comment.
  * `(modulePath: string, importPath: string) => Mode | false` - Same as using a function for the loader option.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### [`webpackPrefetch`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)

**type**

```ts
boolean
| Glob
| CommentFunc<boolean>
| CommentConfig<CommentOptions>
```

**default** None

Adds `webpackPrefetch` magic comments.

When using a [`CommentConfig`](#commentconfig) this option **does not add additional properties** to [`CommentOptions`](#commentoptions).

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackPrefetch` magic comments with a value of `true` to **all** dynamic imports. 
* `string | string[]` - Add `webpackPrefetch` comment with a value of `true` when the glob(s) match a path from a [`match`](#match) path.
* `(modulePath: string, importPath: string) => boolean` - Returning `false` will disable adding the comment, otherwise it will be added.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### [`webpackPreload`](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)

**type**

```ts
boolean
| Glob
| CommentFunc<boolean>
| CommentConfig<CommentOptions>
```

**default** None

Adds `webpackPreload` magic comments.

When using a [`CommentConfig`](#commentconfig) this option **does not add additional properties** to [`CommentOptions`](#commentoptions).

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackPreload` magic comments with a value of `true` to **all** dynamic imports. 
* `string | string[]` - Add `webpackPreload` comment with a value of `true` when the glob(s) match a path from a [`match`](#match) path.
* `(modulePath: string, importPath: string) => boolean` - Returning `false` will disable adding the comment, otherwise it will be added.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackInclude`

**type**

```ts
RegExp
| CommentFunc<RegExp>
| CommentConfig<WebpackIncludeOptions>
```

**default** None

Adds `webpackInclude` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  include?: RegExp | CommentFunc<RegExp>
}
```

Possible values:
*  `RegExp` - Adds a `webpackInclude` comment to **all** dynamic imports using the provided regular expression.
*  `(modulePath: string, importPath: string) => RegExp` - Adds a `webpackInclude` comment using the provided regular expression. Returning anything other than a regular expression does **not** add the comment.
*  `options.include`:
   * `RegExp` - Adds a `webpackInclude` comment to **all** dynamic imports, or only those matching a path from the [`match`](#match) path if using overrides.
   * `(modulePath: string, importPath: string) => RegExp` - Same as using a function in the loader option.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackExclude`

**type**

```ts
RegExp
| CommentFunc<RegExp>
| CommentConfig<WebpackExcludeOptions>
```

**default** None

Adds `webpackExclude` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  exclude?: RegExp | CommentFunc<RegExp>
}
```

Possible values:
*  `RegExp` - Adds a `webpackExclude` comment to **all** dynamic imports using the provided regular expression.
*  `(modulePath: string, importPath: string) => RegExp` - Adds a `webpackExclude` comment using the provided regular expression. Returning anything other than a regular expression does **not** add the comment.
*  `options.exclude`:
   * `RegExp` - Adds a `webpackExclude` comment to **all** dynamic imports, or only those matching a path from the [`match`](#match) path if using overrides.
   * `(modulePath: string, importPath: string) => RegExp` - Same as using a function in the loader option.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

### `webpackExports`

**type**

```ts
CommentFunc<string[]> | CommentConfig<WebpackExportsOptions>
```

**default** None

Adds `webpackExports` magic comments.

When using a [`CommentConfig`](#commentconfig) the following comment options are supported:
```ts
{
  exports?: CommentFunc<string[]>
}
```

Possible values:
* `(modulePath: string, importPath: string) => string[]` - Adds a `webpackExports` comment using the strings in the returned array as the export names. Returning anything other than an array will **not** add the comment.
* `options.exports`:
  * `(modulePath: string, importPath: string) => string[]` - Same as using a function in the loader option.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.


### `webpackIgnore`

**type**

```ts
boolean
| Glob
| CommentFunc<boolean>
| CommentConfig<CommentOptions>
```

**default** None

Adds `webpackIgnore` magic comments.

When using a [`CommentConfig`](#commentconfig) this option **does not add additional properties** to [`CommentOptions`](#commentoptions).

Possible values:
* `false` - Disables the comment globally. This is the default behavior.
* `true` - Add `webpackIgnore` magic comments with a value of `true` to **all** dynamic imports. Effectively, opt-out of webpack code-splitting for dynamic imports. 
* `string | string[]` - Add `webpackIgnore` comment with a value of `true` when the glob(s) match a path from a [`match`](#match) path.
* `(modulePath: string, importPath: string) => boolean` - Returning `false` will **not** add the comment, otherwise it will be added.
* `options.active`:
  * `true` - Disable the comment.
  * `false` - Enable the comment.

## Examples

Below are some examples. Consult one of the [used by](#used-by) packages, or the unit tests in this repo for something more comprehensive. Particularly, the [loader specification from `magic-comments-loader`](https://github.com/morganney/magic-comments-loader/blob/main/__tests__/loader.spec.js).


### Multiple

Since [`options`](#options) is an object, you can define more than one type of a webpack magic comment.

```js
import { getMagicComment, Mode } from 'magic-comments'

const magicComment = getMagicComment({
  modulePath: '/path/file.js',
  importPath: './import/module.js',
  options: {
    webpackMode: Mode.EAGER,
    webpackPreload: (modulePath, importPath) => {
      return importPath.includes('module')
    }
  }
})

console.log(magicComment) // /* webpackMode: "eager", webpackPreload: true */
```

### Overrides

When using a [`CommentConfig<T>`](#commentconfig) object, you can override the configuration passed in the `options` property by defining `overrides`. It is an array of objects that look like:

```ts
Array<{
  files: string | string[];
  options: T;
}>
```

Where the generic `T` is related to the magic comment the options are associated with. The `files` and `options` keys are both **required**, where the former is a glob string, or an array thereof, and the latter is the associated magic comment's [`CommentOptions`](#commentoptions).

Here's a more complete example of how overrides can be applied.

```js
import  { getMagicComment } from 'magic-comments'

const comment = getMagicComment({
  modulePath: '/file/module.js',
  importPath: './dynamic/import.js',
  options: {
    webpackChunkName: {
      options: { active: false },
      overrides: [
        {
          files: '**/file/*.js',
          options: {
            active: true,
            name: 'override'
          }
        }
      ]
    }
  }
})

console.log(comment) // /* webpackChunkName: "override" */
```

Here, [`match`](#match) is set to `import`, so the glob used in the override will **not match**.

```js
const comment = getMagicComment({
  match: 'import',
  modulePath: '/file/module.js',
  importPath: './dynamic/import.js',
  options: {
    webpackChunkName: {
      options: { active: true },
      overrides: [
        {
          files: '**/file/*.js',
          options: {
            basename: true
          }
        }
      ]
    }
  }
})

console.log(comment) // /* webpackChunkName: "dynamic-import" */
```

Changing the glob to `**/dynamic/*.js` will then match, and the override options will be used.

```js
console.log(comment) // /* webpackChunkName: "import" */
```

## Used by

* [`magic-comments-loader`](https://github.com/morganney/magic-comments-loader)
* [`babel-plugin-magic-comments`](https://github.com/morganney/babel-plugin-magic-comments)
