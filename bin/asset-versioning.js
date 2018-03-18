#!/usr/bin/env node

const fs = require('fs')
const getStdin = require('get-stdin')
const nopt = require('nopt')
const path = require('path')
const promisify = require('util').promisify

const readFile = promisify(fs.readFile)

const assetVersioning = require('../')

const logError = function (message) {
  console.error('asset-versioning: ' + message)
  process.exit(1)
}

const method = process.argv[2]
const args = process.argv.slice(3)

async function build (args) {
  const knownOptions = {
    baseDirectory: String,
    help: Boolean,
    outputDirectory: String
  }
  const shorthands = {
    b: '--baseDirectory',
    baseDir: '--baseDirectory',
    h: '--help',
    o: '--outputDirectory',
    output: '--outputDirectory',
    outputDir: '--outputDirectory'
  }
  const options = nopt(knownOptions, shorthands, args, 0)
  if (options.help) {
    fs
      .createReadStream(path.join(__dirname, 'help', 'build.txt'))
      .pipe(process.stdout)
    return
  }
  const globs = options.argv.remain
  const outputDirectory = options.outputDirectory
  const baseDirectory = options.baseDirectory
  const manifest = await assetVersioning.build(globs, outputDirectory, {
    baseDirectory: baseDirectory
  })
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
}

async function replace (args) {
  const knownOptions = {
    baseDirectory: String,
    help: Boolean,
    manifestFile: String
  }
  const shorthands = {
    b: '--baseDirectory',
    baseDir: '--baseDirectory',
    h: '--help',
    m: '--manifestFile',
    manifest: '--manifestFile'
  }
  const options = nopt(knownOptions, shorthands, args, 0)
  if (options.help) {
    fs
      .createReadStream(path.join(__dirname, 'help', 'replace.txt'))
      .pipe(process.stdout)
    return
  }
  const globs = options.argv.remain
  const manifestFile = options.manifestFile
  const baseDirectory = options.baseDirectory
  const manifest = JSON.parse(
    await (manifestFile ? readFile(manifestFile, 'utf8') : getStdin())
  )
  await assetVersioning.replace(globs, manifest, {
    baseDirectory: baseDirectory
  })
}

const methods = {
  build: build,
  replace: replace
}
if (methods[method] == null) {
  logError()
}
methods[method](args)
