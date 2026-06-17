import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'

const originalDirectory = fileURLToPath(new URL('../public/taisou-original/', import.meta.url))
const outputDirectory = fileURLToPath(new URL('../public/taisou/', import.meta.url))

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} exited with code ${code}`))
      }
    })
  })
}

async function ensureOriginals() {
  await mkdir(originalDirectory, { recursive: true })
  const outputEntries = await readdir(outputDirectory, { withFileTypes: true })

  for (const entry of outputEntries) {
    if (!entry.isFile() || !entry.name.endsWith('.mp4')) {
      continue
    }

    const sourcePath = join(outputDirectory, entry.name)
    const originalPath = join(originalDirectory, entry.name)

    try {
      await stat(originalPath)
    } catch {
      await cp(sourcePath, originalPath)
    }
  }
}

async function mp4Files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mp4'))
    .map((entry) => join(directory, entry.name))
    .sort((first, second) => basename(first).localeCompare(basename(second), undefined, { numeric: true }))
}

await ensureOriginals()

for (const sourcePath of await mp4Files(originalDirectory)) {
  const outputPath = join(outputDirectory, basename(sourcePath))
  const tempPath = `${outputPath}.compressed.mp4`

  await run(ffmpegPath, [
    '-y',
    '-i',
    sourcePath,
    '-vf',
    "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(720,ih))'",
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '28',
    '-pix_fmt',
    'yuv420p',
    '-an',
    '-movflags',
    '+faststart',
    tempPath,
  ])

  await cp(tempPath, outputPath)
  await rm(tempPath)
  const before = await stat(sourcePath)
  const after = await stat(outputPath)

  console.log(
    `${basename(sourcePath)} ${Math.round(before.size / 1024 / 1024)}MB -> ${Math.round(after.size / 1024 / 1024)}MB`,
  )
}
