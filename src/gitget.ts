import { PACKAGE_NAME, addDirectory, error, readTar, removeDirectory, step, success, trim } from './utils'
import { Octokit } from '@octokit/rest'
import { fetch } from './utils'
import path from 'path'
import tar from 'tar'

const PATH = `${path.resolve()}/.gitget`
const FILENAME = `${PATH}/repo.tar.gz`

export interface GitGetOption {
  user: string
  repo: string
  folder?: string
  subdir?: string
  /** specify a tag, branch or commit */
  branch?: string
}

export const gitget = async (options: GitGetOption) => {
  const { user, repo, folder, subdir, branch } = options
  if (!user) error()
  if (!repo) error()

  const USER = trim(user)
  const REPO = trim(repo.split('#')[0])
  const FOLDER = trim(folder)
  const SUBDIR = trim(subdir?.split('#')[0])
  const BRANCH = branch

  // print some infos
  step(`Starting: ${PACKAGE_NAME}`)
  step('User:', USER)
  step('Repo:', REPO)
  if (SUBDIR) step('Subdir:', SUBDIR)

  let defaultBranch = BRANCH

  // detect default branch
  if (!BRANCH) {
    const octokit = new Octokit()
    const res = await octokit.repos
      .get({
        owner: USER,
        repo: REPO
      })
      .catch(err => {
        return error(err.message)
      })

    defaultBranch = res?.data?.default_branch
    if (!defaultBranch) return error('Default branch not found')
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
  tar
    .x(
      {
        file: FILENAME,
        strip: SUBDIR ? SUBDIR.split('/').length + 1 : 1,
        cwd: CWD
      },
      SUBDIR ? [`${firstPath}${SUBDIR}/`] : []
    )
    .then(async () => {
      // remove .tmp directory
      await removeDirectory(PATH).catch(err => error(err.message))

      // done
      const makeBold = (str: string) => `\u001b[1m${str}\u001b[22m`
      success(`Done! Your repo is in /${makeBold(CWD)}.`)
    })
    .catch(err => {
      return error(err.message)
    })
}
