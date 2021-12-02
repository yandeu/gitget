import { download, error, fetch, makeBold, step, success, writeInfoFile } from '../utils'

interface NpmResponse {
  dist: { tarball: string }
}

export const getNpmPackage = async (pkg: string, folder?: string, info = false): Promise<any> => {
  step('Fetch npm data')
  const json = await fetch(`https://registry.npmjs.org/${pkg}/latest`).catch(err => error(err.message))

  step('Parse npm data')
  if (typeof json !== 'string') return error()
  const obj = JSON.parse(json) as NpmResponse

  step('Parse folder name')
  const _folder = folder ?? pkg.replace(/@/, '').replace('/', '-').replace('--', '-')

  if (!info) {
    step('Download npm package')
    await download(obj.dist.tarball, _folder)
  }

  if (info) {
    await writeInfoFile(JSON.stringify(obj, null, 2), _folder)
  }

  // done
  success(`Done! Your ${info ? 'info' : 'package'} is in /${makeBold(_folder)}.`)
  return { success: true }
}
