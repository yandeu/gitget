import { PACKAGE_NAME, addDirectory, error, readTar, removeDirectory, step, success, trim } from './utils'
import { Octokit } from '@octokit/rest'
import { fetch } from './utils'
import path from 'path'
import tar from 'tar'

const PATH = `${path.resolve()}/.gitget`
const FILENAME = `${PATH}/repo.tar.gz`

export const gitget = async (USER: string, REPO: string, FOLDER: string, SUBDIR?: string) => {
  USER = trim(USER)
  REPO = trim(REPO)
  FOLDER = trim(FOLDER)
  SUBDIR = trim(SUBDIR)

  // print some info
  step(`Starting: ${PACKAGE_NAME}`)
  step('User:', USER)
  step('Repo:', REPO)
  if (SUBDIR) step('Subdir:', SUBDIR)

  // detect default branch
  const octokit = new Octokit()
  const res = await octokit.repos
    .get({
      owner: USER,
      repo: REPO
    })
    .catch(err => {
      return error(err.message)
    })

  const defaultBranch = res?.data?.default_branch
  if (!defaultBranch) return error('Default branch not found')

  // create .tmp directory
  await await addDirectory(PATH)

  // download tar
  const downloadName = `https://github.com/${USER}/${REPO}/archive/${defaultBranch}.tar.gz`
  step('Downloading:', downloadName)
  await fetch(downloadName, FILENAME)

  // define folder
  const CWD = FOLDER ?? REPO

  // create  directory
  await await addDirectory(CWD)

  // read first path line of tar
  const firstPath = await readTar(FILENAME)

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
      await removeDirectory(PATH)

      // done
      const makeBold = (str: string) => `\u001b[1m${str}\u001b[22m`
      success(`Done! Your repo is in /${makeBold(CWD)}.`)
    })
    .catch(err => {
      return error(err.message)
    })
}
