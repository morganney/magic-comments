import { jest, describe, expect, it } from '@jest/globals'

import { webpackExports } from '../src/webpackExports.js'

import type { WebpackExportsValue } from '../src/webpackExports.js'

describe('webpackExports', () => {
  it('returns a "webpackExports" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'
    const exports = jest.fn(() => ['mock'])
    const comment = webpackExports({
      modulePath,
      importPath,
      value: { options: { exports } }
    })
    const notAFunc: unknown = false
    const notAnArray: unknown = "'one', 'two'"

    expect(comment).toEqual('webpackExports: ["mock"]')
    expect(exports).toHaveBeenCalledWith('/some/test/module.js', './some/import/path')
    expect(
      webpackExports({ modulePath, importPath, value: notAFunc as WebpackExportsValue })
    ).toEqual('')
    expect(
      webpackExports({
        modulePath,
        importPath,
        value: {
          options: { active: () => true, exports: () => ['one', 'two'] }
        }
      })
    ).toEqual('webpackExports: ["one", "two"]')
    expect(
      webpackExports({
        modulePath,
        importPath,
        value: {
          options: { exports: () => notAnArray as string[] }
        }
      })
    ).toEqual('')
    expect(
      webpackExports({
        modulePath,
        importPath,
        value: {
          options: { exports: () => ['a', 'b'] },
          overrides: [
            {
              files: '**/some/**/*.js',
              options: {
                active: false
              }
            }
          ]
        }
      })
    ).toEqual('')
  })

  it('can be used as a function', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'
    const exports = jest.fn(() => ['mock'])
    const comment = webpackExports({ modulePath, importPath, value: exports })

    expect(comment).toEqual('webpackExports: ["mock"]')
  })
})
