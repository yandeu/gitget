const util = require('util')
const exec = util.promisify(require('child_process').exec)
const pkg = require('../package.json')
const version = pkg.version

const run = async cmd => {
  const { stdout, stderr } = await exec(cmd)
  if (stdout) console.log(stdout)
  if (stderr) console.error(stderr)
}

const main = async () => {
  await run('git add .')
  await run(`git commit -m "v${version}"`)
  await run(`git tag "v${version}"`)
}

main()
