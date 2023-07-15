import { parse } from 'node:path'

import {
  getOverrideSchema,
  getOverrideOptions,
  relativePathPrefix,
  pathIsMatch
} from './util.js'

import type {
  Glob,
  CommentFunc,
  CommentOptions,
  CommentConfig,
  CommentParameters
} from './types.js'

interface WebpackChunkNameOptions extends CommentOptions {
  /**
   * Use the basename of the import specifier as the chunk name.
   */
  basename?: boolean
  /**
   * Provide a custom chunk name. If overrides are not used, this
   * value will be applied to ALL dynamic imports found.
   */
  name?: string
}
type WebpackChunkNameValue =
  | boolean
  | Glob
  | CommentFunc<string | false>
  | CommentConfig<WebpackChunkNameOptions>
type WebpackChunkNameComment = '' | `webpackChunkName: "${string}"`
type WebpackChunkName = (
  ctx: CommentParameters<WebpackChunkNameValue>
) => WebpackChunkNameComment

const optionsSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    basename: {
      type: 'boolean'
    },
    name: {
      type: 'string'
    }
  },
  additionalProperties: false
}
const schema = {
  oneOf: [
    { type: 'boolean' },
    { type: 'string' },
    {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    { instanceof: 'Function' },
    {
      type: 'object',
      properties: {
        options: optionsSchema,
        overrides: getOverrideSchema(optionsSchema)
      },
      required: ['options'],
      additionalProperties: false
    }
  ]
}
const resolve = ({
  match,
  value,
  modulePath,
  importPath
}: CommentParameters<WebpackChunkNameValue>): WebpackChunkNameOptions => {
  const path =
    match === 'import' ? importPath.replace(relativePathPrefix, '') : modulePath

  if (value === true) {
    return {
      active: true
    }
  }

  if (value === false) {
    return {
      active: false
    }
  }

  if (Array.isArray(value) || typeof value === 'string') {
    return {
      active: pathIsMatch(path, value)
    }
  }

  if (typeof value === 'function') {
    const name = value(modulePath, importPath)

    if (name && typeof name === 'string') {
      return {
        name,
        active: true
      }
    }

    return {
      active: false
    }
  }

  let options: WebpackChunkNameOptions = {
    active: true,
    ...value.options
  }

  if (Array.isArray(value.overrides)) {
    options = getOverrideOptions<WebpackChunkNameOptions>(value.overrides, path, options)
  }

  return options
}
const webpackChunkName: WebpackChunkName = (ctx) => {
  const options = resolve(ctx)
  const { modulePath, importPath } = ctx
  const isActive =
    typeof options.active === 'function'
      ? options.active(modulePath, importPath)
      : options.active

  if (!isActive) {
    return ''
  }

  if (options.name) {
    return `webpackChunkName: "${options.name}"`
  }

  const { basename } = options
  const { dir, name } = parse(importPath)
  const segments = `${dir}/${name}`.split('/').filter((segment) => /\w/.test(segment))
  const chunkName = basename
    ? name
    : segments.reduce((prev, curr) => {
        /**
         * Check for dynamic expressions in imports.
         *
         * @see https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
         */
        if (/^\${/.test(curr)) {
          return prev ? `${prev}-[request]` : '[request]'
        }

        return prev ? `${prev}-${curr}` : curr
      }, '')

  return `webpackChunkName: "${chunkName}"`
}

export { webpackChunkName, schema as webpackChunkNameSchema }
export type {
  WebpackChunkNameValue,
  WebpackChunkNameComment,
  WebpackChunkNameOptions,
  WebpackChunkName
}
