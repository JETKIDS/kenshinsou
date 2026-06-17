import { copyFile, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const targetDirectory = fileURLToPath(new URL('../public/taisou/', import.meta.url))

function readAtomSize(buffer, offset) {
  const size32 = buffer.readUInt32BE(offset)

  if (size32 === 1) {
    return Number(buffer.readBigUInt64BE(offset + 8))
  }

  if (size32 === 0) {
    return buffer.length - offset
  }

  return size32
}

function atomHeaderSize(buffer, offset) {
  return buffer.readUInt32BE(offset) === 1 ? 16 : 8
}

function atomType(buffer, offset) {
  return buffer.toString('ascii', offset + 4, offset + 8)
}

function topLevelAtoms(buffer) {
  const atoms = []
  let offset = 0

  while (offset < buffer.length) {
    const size = readAtomSize(buffer, offset)

    if (size < 8 || offset + size > buffer.length) {
      throw new Error(`Invalid atom at offset ${offset}`)
    }

    atoms.push({
      type: atomType(buffer, offset),
      offset,
      size,
    })
    offset += size
  }

  return atoms
}

function patchChunkOffsets(buffer, delta, start = 0, end = buffer.length) {
  let offset = start

  while (offset + 8 <= end) {
    const size = readAtomSize(buffer, offset)

    if (size < 8 || offset + size > end) {
      return
    }

    const type = atomType(buffer, offset)
    const headerSize = atomHeaderSize(buffer, offset)

    if (type === 'stco') {
      const entryCount = buffer.readUInt32BE(offset + headerSize + 4)
      let entryOffset = offset + headerSize + 8

      for (let index = 0; index < entryCount; index += 1) {
        const nextOffset = buffer.readUInt32BE(entryOffset) + delta
        buffer.writeUInt32BE(nextOffset, entryOffset)
        entryOffset += 4
      }
    } else if (type === 'co64') {
      const entryCount = buffer.readUInt32BE(offset + headerSize + 4)
      let entryOffset = offset + headerSize + 8

      for (let index = 0; index < entryCount; index += 1) {
        const nextOffset = buffer.readBigUInt64BE(entryOffset) + BigInt(delta)
        buffer.writeBigUInt64BE(nextOffset, entryOffset)
        entryOffset += 8
      }
    } else if (size > headerSize) {
      patchChunkOffsets(buffer, delta, offset + headerSize, offset + size)
    }

    offset += size
  }
}

async function fastStart(filePath) {
  const buffer = await readFile(filePath)
  const atoms = topLevelAtoms(buffer)
  const ftyp = atoms.find((atom) => atom.type === 'ftyp')
  const moov = atoms.find((atom) => atom.type === 'moov')
  const mdat = atoms.find((atom) => atom.type === 'mdat')

  if (!ftyp || !moov || !mdat) {
    return { filePath, changed: false, reason: 'missing required atom' }
  }

  if (moov.offset < mdat.offset) {
    return { filePath, changed: false, reason: 'already fast start' }
  }

  const patchedMoov = Buffer.from(buffer.subarray(moov.offset, moov.offset + moov.size))
  patchChunkOffsets(patchedMoov, moov.size)

  const pieces = []
  pieces.push(buffer.subarray(ftyp.offset, ftyp.offset + ftyp.size))
  pieces.push(patchedMoov)

  for (const atom of atoms) {
    if (atom.type !== 'ftyp' && atom.type !== 'moov') {
      pieces.push(buffer.subarray(atom.offset, atom.offset + atom.size))
    }
  }

  const output = Buffer.concat(pieces)
  const tempPath = `${filePath}.faststart`

  await writeFile(tempPath, output)
  await copyFile(tempPath, filePath)
  await rm(tempPath)

  return { filePath, changed: true, reason: `moved moov from ${moov.offset} to ${ftyp.size}` }
}

const entries = await readdir(targetDirectory, { withFileTypes: true })
const mp4Files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.mp4'))
  .map((entry) => join(targetDirectory, entry.name))

for (const filePath of mp4Files) {
  const result = await fastStart(filePath)
  console.log(`${result.changed ? 'updated' : 'skipped'} ${filePath}: ${result.reason}`)
}
