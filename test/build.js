const assetVersioning = require('../')

const fs = require('fs-extra')
const path = require('path')
const test = require('tape')

const buildGlobs = ['fixtures/*.md']
const baseDirectory = __dirname
const outputDirectory = 'output'
const outputDirectoryAbsolutePath = path.join(baseDirectory, outputDirectory)

function cleanUp () {
  return fs.remove(outputDirectoryAbsolutePath)
}

test('creates the `outputDirectory`', async function (t) {
  t.plan(2)
  await cleanUp()
  t.false(await fs.pathExists(outputDirectoryAbsolutePath))
  await assetVersioning(buildGlobs, outputDirectory, {
    baseDirectory: baseDirectory
  })
  t.true(await fs.pathExists(outputDirectoryAbsolutePath))
  await cleanUp()
})

test('versions files matched by `buildGlobs`, returns original filenames mapped to their corresponding versioned filenames', async function (t) {
  t.plan(1)
  await cleanUp()
  const manifest = await assetVersioning(buildGlobs, outputDirectory, {
    baseDirectory: baseDirectory
  })
  t.looseEqual(manifest, {
    'fixtures/bar.md': 'fixtures/bar-b88f2c2110.md',
    'fixtures/foo.md': 'fixtures/foo-965e462b91.md'
  })
  await cleanUp()
})

test('does not create `outputDirectory` if `buildGlobs` do not match any file', async function (t) {
  t.plan(2)
  await cleanUp()
  t.false(await fs.pathExists(outputDirectoryAbsolutePath))
  await assetVersioning(['nonExistentDirectory'], outputDirectory, {
    baseDirectory: baseDirectory
  })
  t.false(await fs.pathExists(outputDirectoryAbsolutePath))
  await cleanUp()
})

test('`manifest` is an empty object if `buildGlobs` do not match any file', async function (t) {
  t.plan(1)
  await cleanUp()
  const manifest = await assetVersioning(['nonExistentDirectory'], outputDirectory, {
    baseDirectory: baseDirectory
  })
  t.looseEqual(manifest, {})
  await cleanUp()
})

test('versions files matched by `buildGlobs`, outputs the versioned files the `outputDirectory`', async function (t) {
  t.plan(6)
  await cleanUp()
  const manifest = await assetVersioning(buildGlobs, outputDirectory, {
    baseDirectory: baseDirectory
  })
  await Object.keys(manifest).map(async function (originalFile) {
    const originalFileAbsolutePath = path.join(baseDirectory, originalFile)
    t.true(await fs.pathExists(originalFileAbsolutePath))
    const versionedFileAbsolutePath = path.join(
      outputDirectoryAbsolutePath,
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
