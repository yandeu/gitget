const { gitget } = require('../lib/gitget.js')
const util = require('util')
const { existsSync } = require('fs')
const exec = util.promisify(require('child_process').exec)

const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
const ERROR_CODE = 1

describe('dry run', () => {
  test('Simple test', async () => {
    const res = await gitget({ test: true, user: 'yandeu', repo: 'gitget' })
    expect(res.str).toBe('Clone yandeu/gitget#default to /gitget.')
  })

  test('User missing', async () => {
    await gitget({ test: true, user: 'yandeu' })
    expect(mockExit).toHaveBeenCalledWith(ERROR_CODE)
  })

  test('Repo missing', async () => {
    await gitget({ test: true, repo: 'gitget' })
    expect(mockExit).toHaveBeenCalledWith(ERROR_CODE)
  })
})

describe('CLI', () => {
  test('Github Repository', async () => {
    const { stdout, stderr } = await exec(`node lib/bin.js yandeu/gitget test/.tmp/one`)
    const exists = existsSync('test/.tmp/one/README.md')
    expect(exists).toBe(true)
  })

  test('Github Information', async () => {
    const { stdout, stderr } = await exec(`node lib/bin.js yandeu/gitget test/.tmp/two -i`)
    const exists = existsSync('test/.tmp/two/info.json')
    expect(exists).toBe(true)
  })

  test('NPM Package', async () => {
    const { stdout, stderr } = await exec(`node lib/bin.js npm:gitget test/.tmp/three`)
    const exists = existsSync('test/.tmp/three/README.md')
    expect(exists).toBe(true)
  })

  test('NPM Information', async () => {
    const { stdout, stderr } = await exec(`node lib/bin.js npm:gitget test/.tmp/four -i`)
    const exists = existsSync('test/.tmp/four/info.json')
    expect(exists).toBe(true)
  })
})

afterAll(async () => {
  await exec(`npx rimraf test/.tmp`)
})
