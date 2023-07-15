import { getOverrideOptions, getOverrideSchema } from './util.js'

import type {
  CommentOptions,
  CommentFunc,
  CommentConfig,
  CommentParameters
} from './types.js'

interface WebpackExcludeOptions extends CommentOptions {
  exclude?: RegExp | CommentFunc<RegExp>
}
interface ResolveParams {
  value: WebpackExcludeValue
  modulePath: string
}
type WebpackExcludeValue =
  | RegExp
  | CommentFunc<RegExp>
  | CommentConfig<WebpackExcludeOptions>
type WebpackExcludeComment = '' | `webpackExclude: /${string}/${string}`
type WebpackExclude = (
  ctx: CommentParameters<WebpackExcludeValue>
) => WebpackExcludeComment

const optionsSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    exclude: {
      oneOf: [{ instanceof: 'Function' }, { instanceof: 'RegExp' }]
    }
  },
  additionalProperties: false
}
const schema = {
  oneOf: [
    { instanceof: 'Function' },
    { instanceof: 'RegExp' },
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
const resolve = ({ value, modulePath }: ResolveParams): WebpackExcludeOptions => {
  if (typeof value === 'function' || value instanceof RegExp) {
    return {
      active: true,
      exclude: value
    }
  }

  let options: WebpackExcludeOptions = { active: true, ...value.options }

  if (Array.isArray(value.overrides)) {
    options = getOverrideOptions<WebpackExcludeOptions>(
      value.overrides,
      modulePath,
      options
    )
  }

  return options
}
const webpackExclude: WebpackExclude = ({ modulePath, importPath, value }) => {
  let regex = null
  const options = resolve({ value, modulePath })
  const isActive =
    typeof options.active === 'function'
      ? options.active(modulePath, importPath)
      : options.active

  if (!isActive) {
    return ''
  }

  if (typeof options.exclude === 'function') {
    regex = options.exclude(modulePath, importPath)
  }

  if (options.exclude instanceof RegExp) {
    regex = options.exclude
  }

  if (!(regex instanceof RegExp)) {
    return ''
  }

  const source = regex.source
  /**
   * Check if the provided RegExp ends in one or more '*'
   * and if so be sure to escape the ending '/' in the
   * comments regular expression so as not to break the
   * comment and cause a SyntaxError.
   */
  if (/(\*+)$/.test(source)) {
    return `webpackExclude: /${source}\\/${regex.flags}`
  }

  return `webpackExclude: /${source}/${regex.flags}`
}

export { webpackExclude, schema as webpackExcludeSchema }
export type {
  WebpackExclude,
  WebpackExcludeComment,
  WebpackExcludeOptions,
  WebpackExcludeValue
}
