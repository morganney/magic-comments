import { describe, expect, it } from '@jest/globals'

import { webpackFetchPriority } from '../src/webpackFetchPriority.js'

import { FetchPriority } from '../src/webpackFetchPriority.js'

describe('webpackFetchPriority', () => {
  it('returns a "webpackFetchPriority" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'

    expect(webpackFetchPriority({ modulePath, importPath, value: true })).toEqual(
      'webpackFetchPriority: "auto"'
    )
    expect(webpackFetchPriority({ modulePath, importPath, value: false })).toEqual('')
    expect(
      webpackFetchPriority({ modulePath, importPath, value: FetchPriority.HIGH })
    ).toEqual('webpackFetchPriority: "high"')
    expect(
      webpackFetchPriority({ modulePath, importPath, value: () => FetchPriority.LOW })
    ).toEqual('webpackFetchPriority: "low"')
    expect(
      webpackFetchPriority({
        modulePath,
        importPath,
        value: () => 'invalid' as FetchPriority
      })
    ).toEqual('')
    expect(
      webpackFetchPriority({
        modulePath,
        importPath,
        value: {
          options: { fetchPriority: FetchPriority.HIGH, active: () => true }
        }
      })
    ).toEqual('webpackFetchPriority: "high"')
    expect(
      webpackFetchPriority({
        modulePath,
        importPath,
        value: {
          options: { fetchPriority: () => FetchPriority.HIGH }
        }
      })
    ).toEqual('webpackFetchPriority: "high"')
    expect(
      webpackFetchPriority({
        modulePath,
        importPath,
        value: {
          options: { fetchPriority: FetchPriority.HIGH },
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
