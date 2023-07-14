import { getOverrideSchema, getOverrideOptions } from './util.js'

import type {
  CommentOptions,
  CommentParameters,
  CommentFunc,
  CommentConfig
} from './types.js'

enum Mode {
  LAZY = 'lazy',
  LAZY_ONCE = 'lazy-once',
  EAGER = 'eager',
  WEAK = 'weak'
}
interface WebpackModeOptions extends CommentOptions {
  mode?: Mode | CommentFunc<false | Mode>
}
interface ResolveParams {
  value: WebpackModeValue
  modulePath: string
}
type WebpackModeValue =
  | boolean
  | Mode
  | CommentFunc<false | Mode>
  | CommentConfig<WebpackModeOptions>
type WebpackModeComment = '' | `webpackMode: "${Mode}"`
type WebpackMode = (ctx: CommentParameters<WebpackModeValue>) => WebpackModeComment

const enums = Object.values(Mode)
const optionSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    mode: {
      oneOf: [{ enum: enums }, { instanceof: 'Function' }]
    }
  },
  additionalProperties: false
}
const schema = {
  oneOf: [
    { type: 'boolean' },
    { type: 'string' },
    { instanceof: 'Function' },
    {
      type: 'object',
      properties: {
        options: optionSchema,
        overrides: getOverrideSchema(optionSchema)
      },
      required: ['options'],
      additionalProperties: false
    }
  ]
}
const defaultOptions = {
  active: true,
  mode: Mode.LAZY
}
const resolve = ({ value, modulePath }: ResolveParams): WebpackModeOptions => {
  if (value === true) {
    return {
      active: true,
      mode: Mode.LAZY
    }
  }

  if (value === false) {
    return {
      active: false,
      mode: Mode.LAZY
    }
  }

  if (typeof value === 'string' || typeof value === 'function') {
    return {
      active: true,
      mode: value
    }
  }

  let options: WebpackModeOptions = { ...defaultOptions, ...value.options }

  if (Array.isArray(value.overrides)) {
    options = getOverrideOptions<WebpackModeOptions>(value.overrides, modulePath, options)
  }

  return options
}
const webpackMode: WebpackMode = ({ value, modulePath, importPath }) => {
  let enumValue = null
  const options = resolve({ value, modulePath })
  const isActive =
    typeof options.active === 'function'
      ? options.active(modulePath, importPath)
      : options.active

  if (!isActive) {
    return ''
  }

  if (typeof options.mode === 'function') {
    enumValue = options.mode(modulePath, importPath)
  }

  if (typeof options.mode === 'string') {
    enumValue = options.mode
  }

  if (!enumValue || !enums.includes(enumValue)) {
    return ''
  }

  return `webpackMode: "${enumValue}"`
}

export { webpackMode, Mode, schema as webpackModeSchema }
export type { WebpackModeOptions, WebpackModeValue, WebpackModeComment, WebpackMode }
