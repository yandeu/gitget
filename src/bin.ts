#!/usr/bin/env node

import { error } from './utils'
import { gitget } from './gitget'

const KEYS = process.argv.slice(2)
if (KEYS.length === 0 || KEYS.length > 2) error()

const USER = KEYS[0].split('/')[0]
const REPO = KEYS[0].split('/')[1]
const SUBDIR = KEYS[0]
  .replace(/\/$/, '')
  .split('/')
  .filter((v, i) => i >= 2)
  .join('/')
const FOLDER = KEYS[1]

gitget(USER, REPO, FOLDER, SUBDIR)
