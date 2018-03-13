const fs = require('fs-extra')
const path = require('path')
const revFile = require('rev-file')
const through2 = require('through2')
const util = require('util')

const glob = util.promisify(require('glob'))
const writeFile = util.promisify(fs.writeFile)

async function getFiles (globs) {
  const globResult = await Promise.all(
    globs.map(function (pattern) {
      return glob(pattern)
    })
  )
  return globResult.reduce(function (result, files) {
    return result.concat(files)
  }, [])
}

async function build (globs, outputDirectory) {
  const manifest = {}
  const files = await getFiles(globs)
  await fs.ensureDir(outputDirectory)
  await Promise.all(
    files.map(async function (file) {
      const revvedFile = await revFile(file)
      manifest[file] = revvedFile
      return fs.copyFile(file, path.join(outputDirectory, revvedFile))
    })
  )
  return manifest
}

async function replace (globs, manifest) {
  const files = await getFiles(globs)
  return Promise.all(
    files.map(async function (file) {
      const content = await fs.readFile(file, 'utf8')
      const result = Object.keys(manifest).reduce(function (
        content,
        originalFile
      ) {
        const split = content.split(originalFile)
        if (split.length > 1) {
          return split.join(manifest[originalFile])
        }
        return content
      },
      content)
      return writeFile(file, result)
    })
  )
}

module.exports = build
module.exports.replace = replace
