const fs = require('fs-extra')
const path = require('path')
const revFile = require('rev-file')
const util = require('util')

const glob = util.promisify(require('glob'))
const isBinaryFile = util.promisify(require('isbinaryfile'))
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

async function build (globs, outputDirectory, options) {
  const baseDirectory = options ? options.baseDirectory : process.cwd()
  const manifest = {}
  const files = await getFiles(globs, baseDirectory)
  if (files.length === 0) {
    return {}
  }
  await fs.ensureDir(path.join(baseDirectory, outputDirectory))
  await Promise.all(
    files.map(async function (file) {
      const fileAbsolutePath = path.join(baseDirectory, file)
      const versionedFileAbsolutePath = await revFile(fileAbsolutePath)
      const versionedFile = path.join(
        path.dirname(file),
        path.basename(versionedFileAbsolutePath)
      )
      manifest[file] = versionedFile
      return fs.copy(
        fileAbsolutePath,
        path.join(baseDirectory, outputDirectory, versionedFile)
      )
    })
  )
  return manifest
}

async function replace (globs, manifest, options) {
  const baseDirectory = options ? options.baseDirectory : process.cwd()
  const files = await getFiles(globs, baseDirectory)
  return Promise.all(
    files.map(async function (file) {
      const fileAbsolutePath = path.join(baseDirectory, file)
      if (await isBinaryFile(fileAbsolutePath)) {
        return Promise.resolve()
      }
      const content = await fs.readFile(fileAbsolutePath, 'utf8')
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
      return writeFile(fileAbsolutePath, result)
    })
  )
}

module.exports = build
module.exports.replace = replace
