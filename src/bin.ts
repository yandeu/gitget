#!/usr/bin/env node

import { REGEX, error, isOption, parseGithubUrl } from './utils'
import { gitget } from './gitget'

let KEYS = process.argv.slice(2)
if (KEYS.length === 0 || KEYS.length > 3) error()

// check for -i flag
let fetchInfo = false
const fetchInfoIndex = KEYS.indexOf('-i')
if (fetchInfoIndex) {
  KEYS = [...KEYS.slice(0, fetchInfoIndex), ...KEYS.slice(fetchInfoIndex + 1)]
  fetchInfo = true
}

const main = async () => {
  const isNpm = KEYS[0].match(REGEX.npm)
  if (isNpm) {
    const folder = !isOption(KEYS[1]) ? KEYS[1] : undefined
    return await gitget({ npm: KEYS[0].replace(/^npm:/, ''), folder: folder, info: fetchInfo })
  }

  KEYS[0] = parseGithubUrl(KEYS[0])

  const USER = KEYS[0].split('/')[0]
  const REPO = KEYS[0].split('/')[1]
  if (!REPO) error()

  const SUBDIR = KEYS[0]
    .replace(/\/$/, '')
    .split('/')
    .filter((v, i) => i >= 2)
    .join('/')

  const FOLDER = KEYS[1]
  const BRANCH = SUBDIR ? SUBDIR.split('#')[1] : REPO.split('#')[1]

  return await gitget({ folder: FOLDER, user: USER, subdir: SUBDIR, branch: BRANCH, repo: REPO, info: fetchInfo })
}

main()
