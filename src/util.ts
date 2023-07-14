import micromatch from 'micromatch'

import type { Override, CommentSchema, CommentOptions } from './types.js'

const pathIsMatch = (path: string, files: string | string[]) => {
  const globs: string[] = []
  const notglobs: string[] = []

  if (!Array.isArray(files)) {
    files = [files]
  }

  files.forEach((file) => {
    if (/^!/.test(file)) {
      notglobs.push(file)
    } else {
      globs.push(file)
    }
  })

  return (
    (globs.length === 0 || globs.some((glob) => micromatch.isMatch(path, glob))) &&
    notglobs.every((notglob) => micromatch.isMatch(path, notglob))
  )
}
const getOverrideSchema = (commentSchema: CommentSchema) => ({
  type: 'array',
  items: {
    type: 'object',
    properties: {
      options: commentSchema,
      files: {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        ]
      }
    },
    additionalProperties: false
  }
})
const getOverrideOptions = <T extends CommentOptions>(
  overrides: Override<T>[],
  modulePath: string,
  options: T
): T => {
  const length = overrides.length

  for (let i = 0; i < length; i++) {
    if (pathIsMatch(modulePath, overrides[i].files)) {
      return { ...options, ...overrides[i].options }
    }
  }

  return options
}
const relativePathPrefix = /^(?:(\.{1,2}\/)+)/
const dynamicImportsWithoutComments =
  /(?<![\w.]|#!|(?:\/{2}.+\n?)+|\/\*[\s\w]*?|\*.+?|['"`][^)$,\n]*)import\s*\((?!\s*\/\*)(?<path>\s*?['"`][^)]+['"`]\s*)\)(?!\s*?\*\/)/gm

export {
  getOverrideOptions,
  getOverrideSchema,
  pathIsMatch,
  relativePathPrefix,
  dynamicImportsWithoutComments
}
