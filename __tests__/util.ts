import { describe, expect, it } from '@jest/globals'

import {
  pathIsMatch,
  getOverrideOptions,
  dynamicImportsWithoutComments
} from '../src/util.js'

import type { CommentOptions } from '../src/types.js'

interface TestOptions extends CommentOptions {
  test: boolean | string
}

describe('dynamicImportsWithoutComments', () => {
  it('is a regex to match dyanmic imports', () => {
    expect(
      `const str = 'import("some/path")'`.replace(dynamicImportsWithoutComments, 'test')
    ).toEqual(`const str = 'import("some/path")'`)
    expect('import("some/path")'.replace(dynamicImportsWithoutComments, 'test')).toEqual(
      'test'
    )
    expect(
      `import(
      "some/path"
    )`.replace(dynamicImportsWithoutComments, 'test')
    ).toEqual('test')
    expect(
      `import(/* with comments */ "some/path")`.replace(
        dynamicImportsWithoutComments,
        'test'
      )
    ).toEqual(`import(/* with comments */ "some/path")`)
    expect(
      `console.log('import("some/path")')`.replace(dynamicImportsWithoutComments, 'test')
    ).toEqual(`console.log('import("some/path")')`)
  })
})

describe('pathIsMatch', () => {
  it('compares a filepath to glob patterns', () => {
    expect(pathIsMatch('some/file/path.js', '**/some/**/*.js')).toEqual(true)
    expect(pathIsMatch('some/file/path', ['**/some/**/*.js', '!some/file/*.js'])).toEqual(
      false
    )
    expect(
      pathIsMatch('some/file/path.js', ['**/some/**/*.js', '!some/miss/*.js'])
    ).toEqual(true)
  })
})

describe('getOverrideOptions', () => {
  const overrides = [
    {
      files: '**/some/**/*.js',
      options: {
        test: true
      }
    }
  ]

  it('gets options overrides based on path globs', () => {
    expect(
      getOverrideOptions<TestOptions>(overrides, 'some/file/path.js', { test: false })
    ).toStrictEqual({
      test: true
    })
  })

  it('returns the passed options if filepath is not a match', () => {
    const options = { test: 'it' }

    expect(getOverrideOptions<TestOptions>(overrides, 'miss/file/path.js', options)).toBe(
      options
    )
  })
})
