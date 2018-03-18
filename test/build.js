const assetVersioning = require('../')

const fs = require('fs-extra')
const path = require('path')
const test = require('tape')

const globs = ['fixtures/*.md']
const baseDirectory = __dirname
const outputDirectory = path.join(__dirname, 'build')

function cleanUp () {
  return fs.remove(outputDirectory)
}

test('creates the `outputDirectory`', async function (t) {
  t.plan(2)
  await cleanUp()
  t.false(await fs.pathExists(outputDirectory))
  await assetVersioning.build(globs, {
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory
  })
  t.true(await fs.pathExists(outputDirectory))
  await cleanUp()
})

test('versions files matched by `globs`, returns original filenames mapped to their corresponding versioned filenames', async function (t) {
  t.plan(1)
  await cleanUp()
  const manifest = await assetVersioning.build(globs, {
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory
  })
  t.looseEqual(manifest, {
    'fixtures/bar.md': 'fixtures/bar-b88f2c2110.md',
    'fixtures/foo.md': 'fixtures/foo-965e462b91.md'
  })
  await cleanUp()
})

test('does not create `outputDirectory` if `globs` do not match any file', async function (t) {
  t.plan(3)
  await cleanUp()
  const nonExistentDirectory = 'non-existent-directory'
  t.false(await fs.pathExists(nonExistentDirectory))
  t.false(await fs.pathExists(outputDirectory))
  await assetVersioning.build([`${nonExistentDirectory}/**/*`], {
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory
  })
  t.false(await fs.pathExists(outputDirectory))
  await cleanUp()
})

test('`manifest` is an empty object if `globs` do not match any file', async function (t) {
  t.plan(2)
  await cleanUp()
  const nonExistentDirectory = 'non-existent-directory'
  t.false(await fs.pathExists(nonExistentDirectory))
  const manifest = await assetVersioning.build([`${nonExistentDirectory}/**/*`], {
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory
  })
  t.looseEqual(manifest, {})
  await cleanUp()
})

test('versions files matched by `globs`, outputs the versioned files into the `outputDirectory`', async function (t) {
  t.plan(6)
  await cleanUp()
  const manifest = await assetVersioning.build(globs, {
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory
  })
  await Object.keys(manifest).map(async function (originalFile) {
    const originalFileAbsolutePath = path.join(baseDirectory, originalFile)
    t.true(await fs.pathExists(originalFileAbsolutePath))
    const versionedFileAbsolutePath = path.join(
      outputDirectory,
      manifest[originalFile]
    )
    t.true(await fs.pathExists(versionedFileAbsolutePath))
    const originalFileContent = await fs.readFile(
      originalFileAbsolutePath,
      'utf8'
    )
    const versionedFileContent = await fs.readFile(
      versionedFileAbsolutePath,
      'utf8'
    )
    t.equal(originalFileContent, versionedFileContent)
  })
  await cleanUp()
})
