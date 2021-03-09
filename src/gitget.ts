import { PACKAGE_NAME, addDirectory, error, removeDirectory, step, success, readTar } from './utils'
import { Octokit } from '@octokit/rest'
import { fetch } from './utils'
import path from 'path'
import tar from 'tar'

step(`Starting: ${PACKAGE_NAME}`)

const PATH = `${path.resolve()}/.gitget`
const FILENAME = `${PATH}/repo.tar.gz`

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

step('User:', USER)
step('Repo:', REPO)
if (SUBDIR) step('Subdir:', SUBDIR)

const main = async () => {
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

main()
