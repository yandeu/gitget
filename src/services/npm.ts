import { download, error, fetch, makeBold, step, success } from '../utils'

interface NpmResponse {
  'dist-tags': { latest: string }
  versions: {
    [version: string]: {
      dist: {
        tarball: string
      }
    }
  }
}

export const getNpmPackage = async (pkg: string, folder?: string): Promise<any> => {
  step('Fetch npm data')
  const json = await fetch(`https://registry.npmjs.org/${pkg}`).catch(err => error(err.message))

  step('Parse npm data')
  if (typeof json !== 'string') return error()
  const obj = JSON.parse(json) as NpmResponse

  step('Parse folder name')
  const _folder = folder ?? pkg.replace(/@/, '').replace('/', '-').replace('--', '-')

  step('Download npm package')
  const version = obj['dist-tags'].latest
  await download(obj.versions[version].dist.tarball, _folder)

  // done
  success(`Done! Your package is in /${makeBold(_folder)}.`)
  return { success: true }
}
