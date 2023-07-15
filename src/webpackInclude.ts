import { getOverrideOptions, getOverrideSchema } from './util.js'

import type {
  CommentOptions,
  CommentFunc,
  CommentConfig,
  CommentParameters
} from './types.js'

interface WebpackIncludeOptions extends CommentOptions {
  include?: RegExp | CommentFunc<RegExp>
}
interface ResolveParams {
  value: WebpackIncludeValue
  modulePath: string
}
type WebpackIncludeValue =
  | RegExp
  | CommentFunc<RegExp>
  | CommentConfig<WebpackIncludeOptions>
type WebpackIncludeComment = '' | `webpackInclude: /${string}/${string}`
type WebpackInclude = (
  ctx: CommentParameters<WebpackIncludeValue>
) => WebpackIncludeComment

const optionsSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    include: {
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
const resolve = ({ value, modulePath }: ResolveParams): WebpackIncludeOptions => {
  if (typeof value === 'function' || value instanceof RegExp) {
    return {
      active: true,
      include: value
    }
  }

  let options: WebpackIncludeOptions = { active: true, ...value.options }

  if (Array.isArray(value.overrides)) {
    options = getOverrideOptions<WebpackIncludeOptions>(
      value.overrides,
      modulePath,
      options
    )
  }

  return options
}
const webpackInclude: WebpackInclude = ({ modulePath, importPath, value }) => {
  let regex = null
  const options = resolve({ value, modulePath })
  const isActive =
    typeof options.active === 'function'
      ? options.active(modulePath, importPath)
      : options.active

  if (!isActive) {
    return ''
  }

  if (typeof options.include === 'function') {
    regex = options.include(modulePath, importPath)
  }

  if (options.include instanceof RegExp) {
    regex = options.include
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
    return `webpackInclude: /${source}\\/${regex.flags}`
  }

  return `webpackInclude: /${source}/${regex.flags}`
}

export { webpackInclude, schema as webpackIncludeSchema }
export type {
  WebpackInclude,
  WebpackIncludeOptions,
  WebpackIncludeValue,
  WebpackIncludeComment
}
