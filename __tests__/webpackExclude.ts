import { jest, describe, expect, it } from '@jest/globals'

import { webpackExclude } from '../src/webpackExclude.js'

import type { WebpackExcludeValue } from '../src/webpackExclude.js'

describe('webpackExclude', () => {
  it('returns a "webpackExclude" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'
    const regex = /path\/.+\.json$/
    const regexAsterisk = /\.js \**/
    const exclude = jest.fn(() => regex)
    const comment = webpackExclude({
      modulePath,
      importPath,
      value: { options: { exclude } }
    })
    const notRegex: unknown = false

    expect(comment).toEqual(`webpackExclude: /${regex.source}/`)
    expect(exclude).toHaveBeenCalledWith('/some/test/module.js', './some/import/path')
    expect(
      webpackExclude({ modulePath, importPath, value: notRegex as WebpackExcludeValue })
    ).toEqual('')
    expect(
      webpackExclude({
        modulePath,
        importPath,
        value: {
          options: { active: () => true, exclude: () => new RegExp(regex, 'i') }
        }
      })
    ).toEqual(`webpackExclude: /${regex.source}/i`)
    expect(
      webpackExclude({
        modulePath,
        importPath,
        value: {
          options: { active: () => false, exclude: () => regex }
        }
      })
    ).toEqual('')
    expect(
      webpackExclude({
        modulePath,
        importPath,
        value: {
          options: { exclude: regex }
        }
      })
    ).toEqual(`webpackExclude: /${regex.source}/`)
    expect(
      webpackExclude({ modulePath, importPath, value: () => regexAsterisk })
    ).toEqual(`webpackExclude: /${regexAsterisk.source}\\/`)
    expect(
      webpackExclude({
        modulePath,
        importPath,
        value: {
          options: { exclude: () => regex },
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
