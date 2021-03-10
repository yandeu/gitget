const { gitget } = require('../lib/gitget')

const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
const ERROR_CODE = 1

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
