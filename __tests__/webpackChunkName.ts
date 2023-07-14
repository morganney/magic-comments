import { describe, expect, it } from '@jest/globals'

import { webpackChunkName } from '../src/webpackChunkName.js'

describe('webpackChunkName', () => {
  it('returns a "webpackChunkName" magic comment', () => {
    const modulePath = '/some/test/module.js'
    const importPath = './some/import/path'
    const importPathExt = './some/import/path.js'

    expect(webpackChunkName({ modulePath, importPath, value: true })).toEqual(
      'webpackChunkName: "some-import-path"'
    )
    expect(webpackChunkName({ modulePath, importPath, value: false })).toEqual('')
    expect(
      webpackChunkName({ modulePath, importPath, value: '**/some/**/*.js' })
    ).toEqual('webpackChunkName: "some-import-path"')
    expect(
      webpackChunkName({
        modulePath,
        importPath,
        value: ['**/some/**/*.js', '!**/some/test/*.js']
      })
    ).toEqual('')
    expect(
      webpackChunkName({
        modulePath,
        importPath: importPathExt,
        value: '**/some/import/**/*.js',
        match: 'import'
      })
    ).toEqual('webpackChunkName: "some-import-path"')
    expect(
      webpackChunkName({
        modulePath,
        importPath,
        value: '**/some/import/**',
        match: 'import'
      })
    ).toEqual('webpackChunkName: "some-import-path"')
    expect(
      webpackChunkName({
        modulePath,
        importPath: importPathExt,
        value: '**/some/import/**/*.js',
        match: 'module'
      })
    ).toEqual('')
    expect(
      webpackChunkName({ modulePath, importPath, value: () => 'test-chunk' })
    ).toEqual('webpackChunkName: "test-chunk"')
    expect(
      webpackChunkName({
        modulePath,
        importPath,
        value: {
          options: { active: () => true, basename: true }
        }
      })
    ).toEqual('webpackChunkName: "path"')
    expect(
      webpackChunkName({
        modulePath,
        importPath,
        value: {
          options: { basename: true },
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
    expect(
      webpackChunkName({
        modulePath,
        importPath,
        value: {
          options: { basename: true },
          overrides: [
            {
              files: '**/notsome/**/*.js',
              options: {
                active: false
              }
            }
          ]
        }
      })
    ).toEqual('webpackChunkName: "path"')
    expect(
      webpackChunkName({ modulePath, importPath: './dynamic/${path}.json', value: true })
    ).toEqual('webpackChunkName: "dynamic-[request]"')
    expect(
      webpackChunkName({ modulePath, importPath: './${path}.json', value: true })
    ).toEqual('webpackChunkName: "[request]"')
  })
})
