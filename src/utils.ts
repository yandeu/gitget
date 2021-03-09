import fs from 'fs'
import https from 'https'
import { symbols } from './symbols'

export const PACKAGE_NAME = 'gitget'

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

        step('statusCode:', code)

        if (!code) return reject()

        if (code >= 400) {
          return reject({ code, message: res.statusMessage })
        } else if (code >= 300) {
          if (typeof headers.location !== 'string') return reject('Location not found')
          fetch(headers.location, dest).then(resolve, reject)
        } else {
          res
            .pipe(fs.createWriteStream(dest))
            .on('finish', () => resolve())
            .on('error', err => reject(err.message))
        }
      })
      .on('error', err => {
        reject(err.message)
      })
  })
}

export const error = (msg?: string) => {
  if (msg) console.error(msg)
  else console.error(`${symbols.error} Usage: ${PACKAGE_NAME} <user/repo> <folder>`)
  process.exit(1)
}

export const step = (...msg: any[]) => {
  console.log(`${symbols.step} ${msg.join(' ')}`)
}

export const success = (msg: string) => {
  console.log(`${symbols.success} ${msg}`)
}
