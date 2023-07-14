import { getOverrideSchema, getOverrideOptions } from './util.js'

import type {
  CommentOptions,
  CommentParameters,
  CommentFunc,
  CommentConfig
} from './types.js'

enum FetchPriority {
  AUTO = 'auto',
  HIGH = 'high',
  LOW = 'low'
}
interface WebpackFetchPriorityOptions extends CommentOptions {
  fetchPriority?: FetchPriority | CommentFunc<false | FetchPriority>
}
interface ResolveParams {
  value: WebpackFetchPriorityValue
  modulePath: string
}
type WebpackFetchPriorityValue =
  | boolean
  | FetchPriority
  | CommentFunc<false | FetchPriority>
  | CommentConfig<WebpackFetchPriorityOptions>
type WebpackFetchPriorityComment = '' | `webpackFetchPriority: "${FetchPriority}"`
type WebpackFetchPriority = (
  ctx: CommentParameters<WebpackFetchPriorityValue>
) => WebpackFetchPriorityComment

const enums = Object.values(FetchPriority)
const optionSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
    },
    fetchPriority: {
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
  fetchPriority: FetchPriority.AUTO
}
const resolve = ({ value, modulePath }: ResolveParams): WebpackFetchPriorityOptions => {
  if (value === true) {
    return {
      active: true,
      fetchPriority: FetchPriority.AUTO
    }
  }

  if (value === false) {
    return {
      active: false,
      fetchPriority: FetchPriority.AUTO
    }
  }

  if (typeof value === 'string' || typeof value === 'function') {
    return {
      active: true,
      fetchPriority: value
    }
  }

  let options: WebpackFetchPriorityOptions = { ...defaultOptions, ...value.options }

  if (Array.isArray(value.overrides)) {
    options = getOverrideOptions<WebpackFetchPriorityOptions>(
      value.overrides,
      modulePath,
      options
    )
  }

  return options
}
const webpackFetchPriority: WebpackFetchPriority = ({
  value,
  modulePath,
  importPath
}) => {
  let enumValue = null
  const options = resolve({ value, modulePath })
  const isActive =
    typeof options.active === 'function'
      ? options.active(modulePath, importPath)
      : options.active

  if (!isActive) {
    return ''
  }

  if (typeof options.fetchPriority === 'function') {
    enumValue = options.fetchPriority(modulePath, importPath)
  }

  if (typeof options.fetchPriority === 'string') {
    enumValue = options.fetchPriority
  }

  if (!enumValue || !enums.includes(enumValue)) {
    return ''
  }

  return `webpackFetchPriority: "${enumValue}"`
}

export { webpackFetchPriority, FetchPriority, schema as webpackFetchPrioritySchema }
export type {
  WebpackFetchPriorityOptions,
  WebpackFetchPriorityValue,
  WebpackFetchPriorityComment,
  WebpackFetchPriority
}
