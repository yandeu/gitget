import { GitGetOption, gitget } from './gitget'
import { parseOptions } from './utils'

export { gitget }

/** Alias for gitget(). */
export const getAdvanced = async (options: GitGetOption) => {
  return await gitget(options)
}

/**
 * Pass arguments separated by a comma (just like if you would use the CLI).
 * @example
 * get('user/repo', 'folder')
 */
export const get = async (...args: string[]) => {
  return await gitget(parseOptions(args))
}
