/**
 * Sets how glob patterns are matched, either the filepath of the module, or the import specifier.
 */
type Match = 'module' | 'import'
/**
 * Glob patterns are matched using micromatch.
 */
type Glob = string | string[]
/**
 * All comments can be defined as a function.
 * @template T - A generic for the return type which varies based on comment.
 * @param modulePath - The absolute filepath to the module using dynamic imports.
 * @param importPath - The specifier used in the dynamic import call.
 * @returns The type passed for the template
 */
interface CommentFunc<T> {
  (modulePath: string, importPath: string): T
}
interface ActiveFunc {
  (modulePath: string, importPath: string): boolean
}
interface CommentOptions {
  active?: boolean | ActiveFunc
}
interface Override<T extends CommentOptions> {
  files: Glob
  options: T
}
interface CommentConfig<T extends CommentOptions> {
  options: T
  overrides?: Override<T>[]
}
interface CommentSchema {
  type: string
  properties: {
    active: {
      oneOf: Array<{
        type?: string
        instanceof?: string
      }>
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [property: string]: any
  }
  additionalProperties: boolean
}
interface CommentParameters<T> {
  modulePath: string
  importPath: string
  value: T
  match?: Match
}

export type {
  Glob,
  Match,
  Override,
  ActiveFunc,
  CommentSchema,
  CommentFunc,
  CommentOptions,
  CommentConfig,
  CommentParameters
}
