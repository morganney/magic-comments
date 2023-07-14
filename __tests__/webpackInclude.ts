import { jest, describe, expect, it } from '@jest/globals'

import { webpackInclude } from '../src/webpackInclude.js'

import type { WebpackIncludeValue } from '../src/webpackInclude.js'

describe('webpackInclude', () => {
  it('returns a "webpackInclude" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'
    const regex = /path\/.+\.json$/
    const regexAsterisk = /\.js \**/
    const include = jest.fn(() => regex)
    const comment = webpackInclude({
      modulePath,
      importPath,
      value: { options: { include } }
    })
    const notRegex: unknown = false

    expect(comment).toEqual(`webpackInclude: /${regex.source}/`)
    expect(include).toHaveBeenCalledWith('/some/test/module.js', './some/import/path')
    expect(
      webpackInclude({ modulePath, importPath, value: notRegex as WebpackIncludeValue })
    ).toEqual('')
    expect(
      webpackInclude({
        modulePath,
        importPath,
        value: {
          options: { active: () => true, include: () => new RegExp(regex, 'i') }
        }
      })
    ).toEqual(`webpackInclude: /${regex.source}/i`)
    expect(
      webpackInclude({
        modulePath,
        importPath,
        value: {
          options: { active: () => false, include: () => regex }
        }
      })
    ).toEqual('')
    expect(
      webpackInclude({
        modulePath,
        importPath,
        value: {
          options: { include: regex }
        }
      })
    ).toEqual(`webpackInclude: /${regex.source}/`)
    expect(
      webpackInclude({ modulePath, importPath, value: () => regexAsterisk })
    ).toEqual(`webpackInclude: /${regexAsterisk.source}\\/`)
    expect(
      webpackInclude({
        modulePath,
        importPath,
        value: {
          options: { include: () => regex },
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
})
