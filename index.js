const fs = require('fs-extra')
const path = require('path')
const promisify = require('util').promisify
const revFile = require('rev-file')

const glob = promisify(require('glob'))
const isBinaryFile = promisify(require('isbinaryfile'))
const writeFile = promisify(fs.writeFile)

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

async function build (globs, options) {
  options = options || {}
  const baseDirectory = options.baseDirectory || process.cwd()
  const outputDirectory = options.outputDirectory || path.join(process.cwd(), 'build')
  const manifest = {}
  const files = await getFiles(globs, baseDirectory)
  if (files.length === 0) {
    return {}
  }
  await fs.ensureDir(outputDirectory)
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
        path.join(outputDirectory, versionedFile)
      )
    })
  )
  return manifest
}

async function replace (globs, manifest, options) {
  const baseDirectory =
    options && options.baseDirectory ? options.baseDirectory : process.cwd()
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

module.exports = {
  build: build,
  replace: replace
}
