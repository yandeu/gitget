import {
  PACKAGE_NAME,
  download,
  error,
  getGithubInfo,
  makeBold,
  setSilent,
  step,
  success,
  trim,
  writeInfoFile
} from './utils'
import { getNpmPackage } from './services/npm'

export interface GitGetOption {
  user?: string
  repo?: string
  folder?: string
  subdir?: string
  /** specify a tag, branch or commit */
  branch?: string
  test?: boolean
  /** silences steps (errors are still displayed) */
  silent?: boolean
  /** npm package name */
  npm?: string
  /** download only information instead */
  info?: boolean
}

export const gitget = async (options: GitGetOption) => {
  const { user, repo, folder, subdir, branch, test, silent, npm = false, info = false } = options

  // set silent
  setSilent(silent)

  // get from npm
  if (npm) {
    const res = await getNpmPackage(npm, folder, info)
    return res
  }

  if (!user) return error()
  if (!repo) return error()

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

  let obj

  // get default branch
  if (!BRANCH) {
    obj = await getGithubInfo(USER, REPO).catch(err => error(err.message))
    if (!obj || !obj.default_branch) return error('Default branch not found')
    defaultBranch = obj.default_branch
    step('Default Branch:', defaultBranch)
  }

  step('Tag/Branch/Commit:', defaultBranch)

  const CWD = FOLDER ?? REPO

  if (!info) {
    const downloadLink = `https://github.com/${USER}/${REPO}/archive/${defaultBranch}.tar.gz`
    await download(downloadLink, CWD, SUBDIR)
  } else {
    await writeInfoFile(JSON.stringify(obj, null, 2), CWD)
  }

  // done
  success(`Done! Your ${info ? 'info' : 'repo'} is in /${makeBold(CWD)}.`)
  return { success: true }
}
