import { Octokit } from '@octokit/rest'
import fs from 'fs'
import https from 'https'
import { symbols } from './symbols'
import tar from 'tar'

export const PACKAGE_NAME = 'gitget'

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
  const octokit = new Octokit()
  const res = await octokit.repos.get({
    owner: USER,
    repo: REPO
  })
  return res?.data?.default_branch
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

export const fetch = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        const code = res.statusCode
        const headers = res.headers

        step('StatusCode:', code)

        if (!code) return reject()

        if (code >= 400) {
          return reject({ code, message: res.statusMessage })
        } else if (code >= 300) {
          if (typeof headers.location !== 'string') return reject(error('Location not found in headers'))
          fetch(headers.location, dest).then(resolve, reject)
        } else {
          res
            .pipe(fs.createWriteStream(dest))
            .on('finish', () => resolve())
            .on('error', err => reject(error(err.message)))
        }
      })
      .on('error', err => {
        reject(error(err.message))
      })
  })
}

export const error = (msg?: string) => {
  if (msg) console.error(`${symbols.error} ${msg}`)
  else console.error(`${symbols.error} Usage: ${PACKAGE_NAME} <user/repo>`)
  process.exit(1)
}

export const step = (...msg: any[]) => {
  console.log(`${symbols.step} ${msg.join(' ')}`)
}

export const success = (msg: string) => {
  console.log(`${symbols.success} ${msg}`)
}
