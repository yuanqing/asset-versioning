const fs = require('fs-extra')
const path = require('path')
const revFile = require('rev-file')
const util = require('util')

const glob = util.promisify(require('glob'))
const writeFile = util.promisify(fs.writeFile)

async function getFiles (globs, baseDirectory) {
  const globResult = await Promise.all(
    globs.map(function (pattern) {
      return glob(pattern, { cwd: baseDirectory })
    })
  )
  return globResult.reduce(function (result, files) {
    return result.concat(files)
  }, [])
}

async function build (globs, outputDirectory, baseDirectory) {
  baseDirectory = baseDirectory || process.cwd()
  const manifest = {}
  const files = await getFiles(globs, baseDirectory)
  if (files.length === 0) {
    return {}
  }
  await fs.ensureDir(path.join(baseDirectory, outputDirectory))
  await Promise.all(
    files.map(async function (file) {
      const fileAbsolutePath = path.join(baseDirectory, file)
      const revvedFileAbsolutePath = await revFile(fileAbsolutePath)
      const revvedFile = path.join(
        path.dirname(file),
        path.basename(revvedFileAbsolutePath)
      )
      manifest[file] = revvedFile
      return fs.copy(
        fileAbsolutePath,
        path.join(baseDirectory, outputDirectory, revvedFile)
      )
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
