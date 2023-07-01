import { webpackChunkName } from './webpackChunkName.js'
import { webpackFetchPriority } from './webpackFetchPriority.js'
import { webpackMode } from './webpackMode.js'
import { webpackIgnore } from './webpackIgnore.js'
import { webpackPreload } from './webpackPreload.js'
import { webpackPrefetch } from './webpackPrefetch.js'
import { webpackExports } from './webpackExports.js'
import { webpackInclude } from './webpackInclude.js'
import { webpackExclude } from './webpackExclude.js'

const commentFor = {
  webpackChunkName,
  webpackFetchPriority,
  webpackMode,
  webpackIgnore,
  webpackPreload,
  webpackPrefetch,
  webpackExports,
  webpackInclude,
  webpackExclude
}
const getMagicComment = ({
  modulePath,
  importPath,
  options = { webpackChunkName: true },
  match = 'module',
  open = false
}) => {
  const bareImportPath = importPath.trim().replace(/^['"`]|['"`]$/g, '')
  const magic = Object.entries(options)
    .map(([key, value]) => commentFor[key](modulePath, bareImportPath, value, match))
    .filter(Boolean)

  if (!magic.length) {
    // The provided comment values produced only falsy results
    return ''
  }

  return open ? ` ${magic.join(', ')} ` : `/* ${magic.join(', ')} */`
}

export { commentFor, getMagicComment }
