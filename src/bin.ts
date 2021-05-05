#!/usr/bin/env node
import { gitget } from './gitget'
import { parseOptions } from './utils'

const main = async () => {
  return await gitget(parseOptions(process.argv.slice(2)))
}

main()
