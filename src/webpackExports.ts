import { getOverrideOptions, getOverrideSchema } from './util.js'

import type {
  CommentOptions,
  CommentFunc,
  CommentConfig,
  CommentParameters
} from './types.js'

interface WebpackExportsOptions extends CommentOptions {
  exports?: CommentFunc<string[]>
}
interface ResolveParams {
  value: WebpackExportsValue
  modulePath: string
}
type WebpackExportsValue = CommentFunc<string[]> | CommentConfig<WebpackExportsOptions>
type WebpackExportsComment = '' | `webpackExports: ["${string}"]`
type WebpackExports = (
  ctx: CommentParameters<WebpackExportsValue>
) => WebpackExportsComment

const optionsSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    exports: {
      instanceof: 'Function'
    }
  },
  additionalProperties: false
}
const schema = {
  oneOf: [
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
const defaultOptions = {
  active: true
}
const resolve = ({ value, modulePath }: ResolveParams): WebpackExportsOptions => {
  if (typeof value === 'function') {
    return {
      ...defaultOptions,
      exports: value
    }
  }

  let options: WebpackExportsOptions = { ...defaultOptions, ...value.options }

  if (Array.isArray(value.overrides)) {
    options = getOverrideOptions<WebpackExportsOptions>(
      value.overrides,
      modulePath,
      options
    )
  }

  return options
}
const webpackExports: WebpackExports = ({ modulePath, importPath, value }) => {
  let configExports: string[] = []
  const options = resolve({ value, modulePath })
  const isActive =
    typeof options.active === 'function'
      ? options.active(modulePath, importPath)
      : options.active

  if (!isActive || typeof options.exports !== 'function') {
    return ''
  }

  configExports = options.exports(modulePath, importPath)

  if (!Array.isArray(configExports)) {
    return ''
  }

  return `webpackExports: ["${configExports.reduce(
    (curr, next) => `${curr}", "${next}`
  )}"]`
}

export { webpackExports, schema as webpackExportsSchema }
export type {
  WebpackExports,
  WebpackExportsComment,
  WebpackExportsOptions,
  WebpackExportsValue
}
