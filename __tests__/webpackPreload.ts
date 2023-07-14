import { describe, expect, it } from '@jest/globals'

import { webpackPreload } from '../src/webpackPreload.js'

describe('webpackPreload', () => {
  it('returns a "webpackPreload" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'

    expect(webpackPreload({ modulePath, importPath, value: true })).toEqual(
      'webpackPreload: true'
    )
    expect(webpackPreload({ modulePath, importPath, value: false })).toEqual('')
    expect(webpackPreload({ modulePath, importPath, value: '**/some/**/*.js' })).toEqual(
      'webpackPreload: true'
    )
    expect(
      webpackPreload({ modulePath, importPath, value: { options: { active: false } } })
    ).toEqual('')
    expect(
      webpackPreload({
        modulePath,
        importPath,
        value: { options: { active: () => true } }
      })
    ).toEqual('webpackPreload: true')
    expect(webpackPreload({ modulePath, importPath, value: () => true })).toEqual(
      'webpackPreload: true'
    )
    expect(webpackPreload({ modulePath, importPath, value: () => false })).toEqual('')
    expect(
      webpackPreload({
        modulePath,
        importPath,
        value: {
          options: { active: false },
          overrides: [
            {
              files: '**/some/**/*.js',
              options: {
                active: true
              }
            }
          ]
        }
      })
    ).toEqual('webpackPreload: true')
  })
})
