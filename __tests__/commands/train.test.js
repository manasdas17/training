const sinon = require('sinon')
const os = require('os')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const stdin = require('mock-stdin').stdin
const train = require('./../../src/commands/train')
const wait = require('./../wait')

const CREDENTIAL_PATH = path.join(os.homedir(), '.cacli', 'credentials')

const prepCredentials = () => {
  const file = `[default]
instance_id: 
username: username
password: password
url: url
access_key_id: access_key_id
secret_access_key: secret_access_key
region: us-geo
`
  fse.outputFileSync(CREDENTIAL_PATH, file)
}

describe('train', () => {
  const keys = { enter: '\x0D' }

  let io = null
  beforeEach(() => {
    io = stdin()
  })
  afterEach(() => {
    fse.removeSync(CREDENTIAL_PATH)
    io.restore()
  })

  it('trains', async () => {
    prepCredentials()
    const promise = train(['--config', '__tests__/config.yaml'])
    // Need to wait twice for some reason...
    await wait()
    await wait()
    io.send('no')
    io.send(keys.enter)
    return promise
  })

  it('trains with a zip', async () => {
    prepCredentials()
    const promise = train([
      '__tests__/fake.zip',
      '--config',
      '__tests__/config.yaml'
    ])
    await wait()
    await wait()
    io.send('no')
    io.send(keys.enter)
    return promise
  })

  it('watches progress', async () => {
    prepCredentials()
    const promise = train(['--config', '__tests__/config.yaml'])
    // Need to wait twice for some reason...
    await wait()
    await wait()
    io.send(keys.enter)
    return promise
  })

  it('runs init if custom config not found', async () => {
    sinon.stub(process, 'exit')
    train(['--config', '__tests__/not-real.yaml'])
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send('no')
    io.send(keys.enter)
  })

  it('runs init if default config not found', async () => {
    sinon.stub(fs, 'readFileSync').throws('file not found')
    sinon.stub(fse, 'readFileSync').throws('file not found')
    sinon.stub(process, 'exit')
    train([])
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send(keys.enter)
    await wait()
    io.send('no')
    io.send(keys.enter)
  })

  it('displays help', async () => {
    sinon.stub(process, 'exit')
    await train(['--help'])
  })
})