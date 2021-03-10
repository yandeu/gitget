import {
  PACKAGE_NAME,
  addDirectory,
  error,
  getDefaultBranch,
  makeBold,
  readTar,
  removeDirectory,
  setSilent,
  step,
  success,
  trim,
  unTar
} from './utils'
import { fetch } from './utils'
import path from 'path'

// const
const PATH = `${path.resolve()}/.gitget`
const FILENAME = `${PATH}/repo.tar.gz`

export interface GitGetOption {
  user: string
  repo: string
  folder?: string
  subdir?: string
  /** specify a tag, branch or commit */
  branch?: string
  test?: boolean
  /** silences steps (errors are still displayed) */
  silent?: boolean
}

export const gitget = async (options: GitGetOption) => {
  const { user, repo, folder, subdir, branch, test, silent } = options
  if (!user) return error()
  if (!repo) return error()

  // set silent
  setSilent(silent)

  // trim input
  const USER = trim(user)
  const REPO = trim(repo.split('#')[0])
  if (!REPO) return error()
  const FOLDER = trim(folder)
  const SUBDIR = trim(subdir?.split('#')[0])
  const BRANCH = branch

  // return test results
  let t = `Clone ${USER}/${REPO}`
  if (SUBDIR) t += `/${SUBDIR}`
  t += `#${BRANCH ? BRANCH : 'default'}`
  t += ` to /${FOLDER ? FOLDER : REPO}.`
  if (test) return { user: USER, repo: REPO, folder: FOLDER, subdir: SUBDIR, branch: BRANCH, isTest: true, str: t }

  // print some infos
  step(`Starting: ${makeBold(PACKAGE_NAME)}`)
  step('User:', USER)
  step('Repo:', REPO)
  if (SUBDIR) step('Subdir:', SUBDIR)

  let defaultBranch = BRANCH

  // get default branch
  if (!BRANCH) {
    defaultBranch = await getDefaultBranch(USER, REPO).catch(err => error(err.message))
    if (!defaultBranch) return error('Default branch not found')
    step('Default Branch:', defaultBranch)
  }

  step('Tag/Branch/Commit:', defaultBranch)

  // create .tmp directory
  await addDirectory(PATH).catch(err => error(err.message))

  // download tar
  const downloadName = `https://github.com/${USER}/${REPO}/archive/${defaultBranch}.tar.gz`
  step('Downloading:', downloadName)
  await fetch(downloadName, FILENAME).catch(err => error(err.message))

  // define folder
  const CWD = FOLDER ?? REPO

  // create  directory
  await addDirectory(CWD).catch(err => error(err.message))

  // read first path line of tar
  const firstPath = await readTar(FILENAME).catch(err => error(err.message))

  // untar
  await unTar(FILENAME, SUBDIR, CWD, firstPath).catch(err => error(err.message))

  // remove .tmp directory
  await removeDirectory(PATH).catch(err => error(err.message))

  // done
  success(`Done! Your repo is in /${makeBold(CWD)}.`)
  return { success: true }
}
