const assetVersioning = require('../')

const fs = require('fs-extra')
const path = require('path')
const test = require('tape')

const buildGlobs = ['fixtures/*.md']
const replaceGlobs = ['build/fixtures/*.md']
const baseDirectory = __dirname
const outputDirectory = path.join(__dirname, 'build')

function cleanUp () {
  return fs.remove(outputDirectory)
}

test('replaces all occurrences of original filenames with their versioned filenames based on the `manifest`', async function (t) {
  t.plan(1)
  await cleanUp()
  const manifest = await assetVersioning.build(buildGlobs, {
    baseDirectory: baseDirectory,
    outputDirectory: outputDirectory
  })
  await assetVersioning.replace(replaceGlobs, manifest, {
    baseDirectory: baseDirectory
  })
  const fileAbsolutePath = path.join(
    outputDirectory,
    manifest['fixtures/foo.md']
  )
  const fileContent = await fs.readFile(fileAbsolutePath, 'utf8')
  t.equal(fileContent, '# foo\n\n[bar](fixtures/bar-b88f2c2110.md)\n')
  await cleanUp()
})
