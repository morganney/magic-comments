import { resolve } from './booleanComment.js'

import type { CommentParameters } from './types.js'
import type { BooleanCommentValue } from './booleanComment.js'

type WebpackIgnoreComment = '' | 'webpackIgnore: true'
type WebpackIgnore = (ctx: CommentParameters<BooleanCommentValue>) => WebpackIgnoreComment

const webpackIgnore: WebpackIgnore = ({ modulePath, importPath, value, match }) => {
  const { active } = resolve({ value, match, modulePath, importPath })
  const isActive = typeof active === 'function' ? active(modulePath, importPath) : active

  if (!isActive) {
    return ''
  }

  return 'webpackIgnore: true'
}

export { webpackIgnore }
export { schema as webpackIgnoreSchema } from './booleanComment.js'
export type { WebpackIgnore, WebpackIgnoreComment }
