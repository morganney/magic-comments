import { describe, expect, it } from '@jest/globals'

import { webpackIgnore } from '../src/webpackIgnore.js'

describe('webpackIgnore', () => {
  it('returns a "webpackIgnore" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'

    expect(webpackIgnore({ modulePath, importPath, value: true })).toEqual(
      'webpackIgnore: true'
    )
    expect(webpackIgnore({ modulePath, importPath, value: '**/some/**/*.js' })).toEqual(
      'webpackIgnore: true'
    )
    expect(
      webpackIgnore({ modulePath, importPath, value: { options: { active: false } } })
    ).toEqual('')
    expect(
      webpackIgnore({
        modulePath,
        importPath,
        value: { options: { active: () => true } }
      })
    ).toEqual('webpackIgnore: true')
    expect(
      webpackIgnore({
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
    ).toEqual('webpackIgnore: true')
  })
})
