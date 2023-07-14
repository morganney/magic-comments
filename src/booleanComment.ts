import { getOverrideSchema, pathIsMatch, relativePathPrefix } from './util.js'

import type {
  Glob,
  ActiveFunc,
  CommentFunc,
  CommentOptions,
  CommentConfig,
  CommentParameters
} from './types.js'

interface BooleanCommentOptions extends CommentOptions {
  active: boolean | ActiveFunc
}
type BooleanCommentValue =
  | boolean
  | Glob
  | CommentFunc<boolean>
  | CommentConfig<BooleanCommentOptions>

const commentOptionsSchema = {
  type: 'object',
  properties: {
    active: {
      oneOf: [{ type: 'boolean' }, { instanceof: 'Function' }]
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
        options: commentOptionsSchema,
        overrides: getOverrideSchema(commentOptionsSchema)
      },
      required: ['options'],
      additionalProperties: false
    }
  ]
}
const resolve = ({
  value,
  match,
  modulePath,
  importPath
}: CommentParameters<BooleanCommentValue>): BooleanCommentOptions => {
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
    if (value(modulePath, importPath)) {
      return {
        active: true
      }
    }

    return {
      active: false
    }
  }

  const options = { ...value.options }

  if (Array.isArray(value.overrides)) {
    const { overrides } = value
    const length = overrides.length

    for (let i = 0; i < length; i++) {
      if (pathIsMatch(path, overrides[i].files)) {
        return { ...options, ...overrides[i].options }
      }
    }
  }

  return options
}

export { schema, resolve }
export type { BooleanCommentOptions, BooleanCommentValue }
