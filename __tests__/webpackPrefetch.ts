import { describe, expect, it } from '@jest/globals'

import { webpackPrefetch } from '../src/webpackPrefetch.js'

describe('webpackPrefetch', () => {
  it('returns a "webpackPrefetch" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'

    expect(webpackPrefetch({ modulePath, importPath, value: true })).toEqual(
      'webpackPrefetch: true'
    )
    expect(webpackPrefetch({ modulePath, importPath, value: false })).toEqual('')
    expect(webpackPrefetch({ modulePath, importPath, value: '**/some/**/*.js' })).toEqual(
      'webpackPrefetch: true'
    )
    expect(
      webpackPrefetch({ modulePath, importPath, value: { options: { active: false } } })
    ).toEqual('')
    expect(
      webpackPrefetch({
        modulePath,
        importPath,
        value: { options: { active: () => true } }
      })
    ).toEqual('webpackPrefetch: true')
    expect(webpackPrefetch({ modulePath, importPath, value: () => true })).toEqual(
      'webpackPrefetch: true'
    )
    expect(webpackPrefetch({ modulePath, importPath, value: () => false })).toEqual('')
    expect(
      webpackPrefetch({
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
    ).toEqual('webpackPrefetch: true')
  })
})
