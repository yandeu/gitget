import fs from 'fs'
import https from 'https'
import path from 'path'
import { symbols } from './symbols'
import tar from 'tar'

let _silent = false

export const setSilent = (silent: boolean | undefined) => {
  if (typeof silent === 'undefined') return
  _silent = silent
}

export const PACKAGE_NAME = 'gitget'
// const
const PATH = `${path.resolve()}/.gitget`
const FILENAME = `${PATH}/repo.tar.gz`

export const parseGithubUrl = (url: string): string => {
  // github url
  const github = /^https:\/\/github\.com\//gm

  // check if it is a github url
  if (!url.match(github)) return url

  // remove domain name
  url = url.replace('https://github.com/', '')

  // reject single files
  if (url.match(/^[\w-\\.]+\/[\w-\\.]+\/blob\//gm)) return error(`Sorry. I can't download single files yet. 😯`)

  // is repo start page (https://github.com/repo/name)
  if (url.match(/^[\w-\\.]+\/[\w-\\.]+$/gm)) return url

  // repo url with subdir and/or branch/tag/commit
  const res = /^([\w-\\.]+\/[\w-\\.]+)\/tree\/([\w-\\.]+)\/(.+)/gm.exec(url)
  if (res && res.length >= 3) return `${res[1]}/${res[3]}#${res[2]}`

  return error('Could not parse github url')
}

export const trim = <T>(str: T): T | string => {
  if (!str) return str

  if (typeof str === 'number' || typeof str === 'string') {
    let tmp = str.toString()
    tmp = tmp.trim()
    tmp = tmp.replace(/^\/|\/$/gm, '')
    return tmp
  }

  return str
}

export const unTar = async (
  FILENAME: string,
  SUBDIR: string | undefined,
  CWD: string,
  firstPath: string | undefined
): Promise<void> => {
  await tar.x(
    {
      file: FILENAME,
      strip: SUBDIR ? SUBDIR.split('/').length + 1 : 1,
      cwd: CWD
    },
    SUBDIR ? [`${firstPath}${SUBDIR}/`] : []
  )
}

export const readTar = (file: string): Promise<string> => {
  return new Promise(resolve => {
    fs.createReadStream(file)
      .pipe(tar.t())
      .on('entry', entry => {
        // return the first path
        return resolve(entry.path)
      })
  })
}

export const makeBold = (str: string) => `\u001b[1m${str}\u001b[22m`

export const getDefaultBranch = async (USER: string, REPO: string) => {
  const options = { headers: { 'User-Agent': 'request', Accept: 'application/vnd.github.v3+json' } }

  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}`, null, options).catch(err =>
    error(err.message)
  )

  if (!res || typeof res !== 'string') return error()

  const json = JSON.parse(res)

  return json.default_branch
}

export const addDirectory = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, async err => {
      if (err) return reject(error(err.message))
      resolve()
    })
  })
}

export const removeDirectory = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.rmdir(path, { recursive: true }, err => {
      if (err) return reject(error(err.message))
      else resolve()
    })
  })
}

export const fetch = (
  url: string,
  dest?: string | null,
  options: https.RequestOptions = {}
): Promise<void | string> => {
  let data = ''

  return new Promise((resolve, reject) => {
    https
      .get(url, options, res => {
        const code = res.statusCode
        const headers = res.headers

        step('StatusCode:', code)

        if (!code) return reject()

        if (code >= 400) {
          return reject({ code, message: res.statusMessage })
        } else if (code >= 300) {
          if (typeof headers.location !== 'string') return reject(error('Location not found in headers'))
          if (headers.location === dest) return reject(error('Link not found'))
          fetch(headers.location, dest).then(resolve, reject)
        } else {
          if (dest) {
            res
              .pipe(fs.createWriteStream(dest))
              .on('finish', () => resolve())
              .on('error', err => reject(error(err.message)))
          } else {
            res
              .on('data', d => {
                data += d.toString()
              })
              .on('end', () => resolve(data))
              .on('error', err => reject(error(err.message)))
          }
        }
      })
      .on('error', err => {
        reject(error(err.message))
      })
  })
}

export const download = async (downloadLink: string, CWD: string, SUBDIR?: string) => {
  // create .tmp directory
  await addDirectory(PATH).catch(err => error(err.message))

  // download tar
  step('Downloading:', downloadLink)
  await fetch(downloadLink, FILENAME).catch(err => error(err.message))

  // create  directory
  await addDirectory(CWD).catch(err => error(err.message))

  // read first path line of tar
  const firstPath = await readTar(FILENAME).catch(err => error(err.message))

  // untar
  await unTar(FILENAME, SUBDIR, CWD, firstPath).catch(err => error(err.message))

  // remove .tmp directory
  await removeDirectory(PATH).catch(err => error(err.message))
}

export const error = (msg?: string) => {
  if (msg) console.error(`${symbols.error} ${msg}`)
  else console.error(`${symbols.error} Usage: ${PACKAGE_NAME} <user/repo>`)
  process.exit(1)
}

export const step = (...msg: any[]) => {
  if (_silent) return
  console.log(`${symbols.step} ${msg.join(' ')}`)
}

export const success = (msg: string) => {
  if (_silent) return
  console.log(`${symbols.success} ${msg}`)
}
