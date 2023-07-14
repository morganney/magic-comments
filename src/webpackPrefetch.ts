import { resolve } from './booleanComment.js'

import type { CommentParameters } from './types.js'
import type { BooleanCommentValue } from './booleanComment.js'

type WebpackPrefetchComment = '' | 'webpackPrefetch: true'
type WebpackPrefetch = (
  ctx: CommentParameters<BooleanCommentValue>
) => WebpackPrefetchComment

const webpackPrefetch = ({
  modulePath,
  importPath,
  value,
  match
}: CommentParameters<BooleanCommentValue>): WebpackPrefetchComment => {
  const { active } = resolve({ value, match, modulePath, importPath })
  const isActive = typeof active === 'function' ? active(modulePath, importPath) : active

  if (!isActive) {
    return ''
  }

  return 'webpackPrefetch: true'
}

export { webpackPrefetch }
export { schema as webpackPrefetchSchema } from './booleanComment.js'
export type { WebpackPrefetch, WebpackPrefetchComment }
