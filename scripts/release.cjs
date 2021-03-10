const util = require('util')
const exec = util.promisify(require('child_process').exec)
const readline = require('readline')
const pkg = require('../package.json')
const version = pkg.version

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const run = async cmd => {
  step(cmd)
  const res = await exec(cmd).catch(err => error(err.message))
  if (res) {
    // const { stdout, stderr } = res
    // if (stdout) console.log(stdout)
    // if (stderr) console.error(stderr)
  } else {
    rl.close()
  }
}

const main = async () => {
  await run('npm run prepublishOnly')
  await run('git add .')
  await run(`git commit -m "v${version}"`)
  await run(`git tag "v${version}"`)
  success('Done! 😊')
  rl.close()
}

const error = str => {
  console.log(`\u001b[31m⨯\u001b[39m ${str}`)
}

const step = str => {
  console.log(`\u001b[34m⠕\u001b[39m Running: ${str}`)
}

const success = str => {
  console.log(`\u001b[32m√\u001b[39m ${str}`)
}

const makeGreen = str => {
  return `\u001b[32m${str}\u001b[39m`
}

const makeGray = str => {
  return `\u001b[90m${str}\u001b[39m`
}

const questionMark = makeGreen('?')
const yesNo = makeGray('(yes/no)')

rl.question(`${questionMark} Release version v${version} ${yesNo} `, async answer => {
  if (answer === 'yes') await main()
  else rl.close()
})
