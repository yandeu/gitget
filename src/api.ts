import { GitGetOption, gitget } from './gitget'
import { parseOptions } from './utils'

export const getAdvanced = async (options: GitGetOption) => {
  return await gitget(options)
}

export const get = async (args: string | Array<string>) => {
  return await gitget(parseOptions(args))
}
