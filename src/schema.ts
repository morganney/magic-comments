import { webpackChunkNameSchema } from './webpackChunkName.js'
import { webpackFetchPrioritySchema } from './webpackFetchPriority.js'
import { webpackModeSchema } from './webpackMode.js'
import { webpackIgnoreSchema } from './webpackIgnore.js'
import { webpackPrefetchSchema } from './webpackPrefetch.js'
import { webpackPreloadSchema } from './webpackPreload.js'
import { webpackExportsSchema } from './webpackExports.js'
import { webpackIncludeSchema } from './webpackInclude.js'
import { webpackExcludeSchema } from './webpackExclude.js'

const schema = {
  type: 'object',
  properties: {
    verbose: {
      type: 'boolean'
    },
    match: {
      enum: ['module', 'import']
    },
    webpackChunkName: webpackChunkNameSchema,
    webpackFetchPriority: webpackFetchPrioritySchema,
    webpackMode: webpackModeSchema,
    webpackIgnore: webpackIgnoreSchema,
    webpackPrefetch: webpackPrefetchSchema,
    webpackPreload: webpackPreloadSchema,
    webpackExports: webpackExportsSchema,
    webpackInclude: webpackIncludeSchema,
    webpackExclude: webpackExcludeSchema
  },
  additionalProperties: false
}

export { schema }
