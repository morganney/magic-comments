import { describe, expect, it } from '@jest/globals'

import { webpackMode } from '../src/webpackMode.js'

import { Mode } from '../src/webpackMode.js'

describe('webpackMode', () => {
  it('returns a "webpackMode" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'

    expect(webpackMode({ modulePath, importPath, value: true })).toEqual(
      'webpackMode: "lazy"'
    )
    expect(webpackMode({ modulePath, importPath, value: false })).toEqual('')
    expect(webpackMode({ modulePath, importPath, value: Mode.EAGER })).toEqual(
      'webpackMode: "eager"'
    )
    expect(webpackMode({ modulePath, importPath, value: () => Mode.LAZY_ONCE })).toEqual(
      'webpackMode: "lazy-once"'
    )
    expect(
      webpackMode({ modulePath, importPath, value: () => 'invalid' as Mode })
    ).toEqual('')
    expect(
      webpackMode({
        modulePath,
        importPath,
        value: {
          options: { mode: Mode.LAZY, active: () => true }
        }
      })
    ).toEqual('webpackMode: "lazy"')
    expect(
      webpackMode({
        modulePath,
        importPath,
        value: {
          options: { mode: () => Mode.WEAK }
        }
      })
    ).toEqual('webpackMode: "weak"')
    expect(
      webpackMode({
        modulePath,
        importPath,
        value: {
          options: { mode: Mode.WEAK },
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
