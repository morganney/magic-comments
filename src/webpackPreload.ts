import { resolve } from './booleanComment.js'

import type { CommentParameters } from './types.js'
import type { BooleanCommentValue } from './booleanComment.js'

type WebpackPreloadComment = '' | 'webpackPreload: true'
type WebpackPreload = (
  ctx: CommentParameters<BooleanCommentValue>
) => WebpackPreloadComment

const webpackPreload = ({
  modulePath,
  importPath,
  value,
  match
}: CommentParameters<BooleanCommentValue>): WebpackPreloadComment => {
  const { active } = resolve({ value, match, modulePath, importPath })
  const isActive = typeof active === 'function' ? active(modulePath, importPath) : active

  if (!isActive) {
    return ''
  }

  return 'webpackPreload: true'
}

export { webpackPreload }
export { schema as webpackPreloadSchema } from './booleanComment.js'
export type { WebpackPreload, WebpackPreloadComment }
