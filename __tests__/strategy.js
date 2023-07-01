import { commentFor, getMagicComment } from '../src/strategy.js'

describe('strategy', () => {
  it('comentFor is an object with functions named after magic comments', () => {
    expect(commentFor).toStrictEqual(
      expect.objectContaining({
        webpackChunkName: expect.any(Function),
        webpackFetchPriority: expect.any(Function),
        webpackMode: expect.any(Function),
        webpackIgnore: expect.any(Function),
        webpackPreload: expect.any(Function),
        webpackPrefetch: expect.any(Function),
        webpackExports: expect.any(Function),
        webpackInclude: expect.any(Function),
        webpackExclude: expect.any(Function)
      })
    )
  })

  it('uses commentFor to return a webpack magic comment string', () => {
    const magicComment = getMagicComment({
      modulePath: '/path/file.js',
      importPath: './import/module.js',
      options: {
        webpackChunkName: true,
        webpackMode: 'eager',
        webpackFetchPriority: 'high',
        webpackIgnore: (modulePath, importPath) => {
          return importPath.includes('module')
        }
      }
    })

    expect(magicComment).toEqual(
      '/* webpackChunkName: "import-module", webpackMode: "eager", webpackFetchPriority: "high", webpackIgnore: true */'
    )
  })

  it('does not create a comment if an option value is/returns falsy', () => {
    const magicComment = getMagicComment({
      modulePath: '/path/file.js',
      importPath: './import/module.js',
      options: {
        webpackPrefetch: false,
        webpackChunkName: () => ''
      }
    })

    expect(magicComment).toEqual('')
  })

  it('uses webpackChunkName as the default and can return an "open" comment', () => {
    const magicComment = getMagicComment({
      open: true,
      modulePath: '/path/file.js',
      importPath: './import/module.js'
    })

    expect(magicComment).toEqual(' webpackChunkName: "import-module" ')
  })
})
