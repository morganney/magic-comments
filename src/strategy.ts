import { webpackChunkName } from './webpackChunkName.js'
import { webpackFetchPriority } from './webpackFetchPriority.js'
import { webpackMode } from './webpackMode.js'
import { webpackIgnore } from './webpackIgnore.js'
import { webpackPreload } from './webpackPreload.js'
import { webpackPrefetch } from './webpackPrefetch.js'
import { webpackExports } from './webpackExports.js'
import { webpackInclude } from './webpackInclude.js'
import { webpackExclude } from './webpackExclude.js'

import type { Match } from './types.js'
import type { BooleanCommentValue } from './booleanComment.js'
import type { WebpackChunkNameValue } from './webpackChunkName.js'
import type { WebpackFetchPriorityValue } from './webpackFetchPriority.js'
import type { WebpackModeValue } from './webpackMode.js'
import type { WebpackExportsValue } from './webpackExports.js'
import type { WebpackIncludeValue } from './webpackInclude.js'
import type { WebpackExcludeValue } from './webpackExclude.js'

interface MagicComments {
  webpackChunkName?: WebpackChunkNameValue
  webpackFetchPriority?: WebpackFetchPriorityValue
  webpackMode?: WebpackModeValue
  webpackIgnore?: BooleanCommentValue
  webpackPreload?: BooleanCommentValue
  webpackPrefetch?: BooleanCommentValue
  webpackExports?: WebpackExportsValue
  webpackInclude?: WebpackIncludeValue
  webpackExclude?: WebpackExcludeValue
}
interface MagicCommentsContext {
  importPath: string
  modulePath: string
  match?: Match
  open?: boolean
  options?: MagicComments
}

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
const isValidName = (name: string) => {
  return name in commentFor
}
const getMagicComment = ({
  modulePath,
  importPath: specifier,
  open = false,
  match = 'module',
  options = { webpackChunkName: true }
}: MagicCommentsContext) => {
  const importPath = specifier.trim().replace(/^['"`]|['"`]$/g, '')
  const magic = Object.entries(options)
    .filter(([key]) => isValidName(key))
    .map(([key, value]) => {
      return commentFor[key as keyof typeof commentFor]({
        value,
        match,
        modulePath,
        importPath
      })
    })
    .filter(Boolean)

  if (!magic.length) {
    // The provided comment values produced only falsy results
    return ''
  }

  return open ? ` ${magic.join(', ')} ` : `/* ${magic.join(', ')} */`
}

export { commentFor, getMagicComment }
export type { MagicComments }
