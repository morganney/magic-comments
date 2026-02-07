import fs from 'node:fs'
import path from 'node:path'

const JS_EXTENSION = '.js'
const TS_EXTENSION = '.ts'

function resolveTsSpecifier(request, options, resolver) {
  if (request.startsWith('.') && request.endsWith(JS_EXTENSION)) {
    const resolvedJs = path.resolve(options.basedir, request)
    const resolvedTs = resolvedJs.slice(0, -JS_EXTENSION.length) + TS_EXTENSION

    if (fs.existsSync(resolvedTs)) {
      const tsRequest = request.slice(0, -JS_EXTENSION.length) + TS_EXTENSION
      try {
        return resolver(tsRequest, options)
      } catch {
        /* fall through to default resolution */
      }
    }
  }

  return resolver(request, options)
}

export function sync(request, options) {
  return resolveTsSpecifier(request, options, options.defaultResolver)
}

export async function async(request, options) {
  return resolveTsSpecifier(request, options, options.defaultAsyncResolver)
}
