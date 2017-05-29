import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const DEFAULT_QUALITY = '320k'

const METADATA_ARGS = {
  'opus': '0:s:0',
  'm4a': '0',
  'ogg': '0:s:0'
}

export function encodeToMp3({ key, sourceFile, quality, slice = { tags: {} }, target }, callback) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target)
    }

    const args = getArguments(key, sourceFile, quality, slice)
    const filename = path.resolve(target, generateFilename(key, slice))
    args.push(filename)

    const ffmpeg = spawn('ffmpeg', args)

    const onData = data => {
      callback(key, data.toString())
    }

    const onClose = code => {
      if (code !== 0) {
        console.error(`Error while encoding Youtube video ID: ${key}`)
      }

      resolve(filename)
    }

    ffmpeg.stdout.on('data', onData)
    ffmpeg.stderr.on('data', onData)
    ffmpeg.on('close', onClose)
  })
}

function getArguments(key, sourceFile, quality, slice) {
  const ffmpegArgs = [
    '-loglevel', 'verbose',
    '-i', sourceFile,
    '-vn',
    '-sn',
    '-y',
    '-c:a', 'mp3'
  ]

  const extension = sourceFile.slice(sourceFile.lastIndexOf('.') + 1)
  const metadataArg = METADATA_ARGS[extension]
  if (!metadataArg) {
    throw new Error(`file extension ${extension} not found in metadata args`)
  }
  ffmpegArgs.push('-map_metadata', metadataArg)

  ffmpegArgs.push('-b:a', quality ? quality : DEFAULT_QUALITY)

  if (slice.tags.track) {
    ffmpegArgs.push('-metadata', `track=${slice.tags.track}`)
  }

  if (slice.tags.title) {
    ffmpegArgs.push('-metadata', `title=${slice.tags.title}`)
  }

  if (slice.tags.artist) {
    ffmpegArgs.push('-metadata', `artist=${slice.tags.artist}`)
  }

  if (slice.tags.album) {
    ffmpegArgs.push('-metadata', `album=${slice.tags.album}`)
  }

  if (slice.start) {
    ffmpegArgs.push('-ss', slice.start.trim())
  }

  if (slice.end) {
    ffmpegArgs.push('-to', slice.end.trim())
  }

  if (slice.duration) {
    ffmpegArgs.push('-t', slice.duration.trim())
  }

  return ffmpegArgs
}

function generateFilename(key, slice) {
  if (!slice.tags) {
    slice.tags = {}
  }

  if (!slice.start) {
    slice.start = '00:00:00'
  }

  const filename = []

  if (slice.tags.track) {
    filename.push(`0${slice.tags.track}`.slice(-2))
  }

  if (slice.tags.artist) {
    filename.push(slice.tags.artist)
  } else {
    filename.push(`youtube_${key}`)
  }

  if (slice.tags.title) {
    filename.push(slice.tags.title)
  } else {
    filename.push(slice.start.replace(/:/g, ''))
  }

  return `${filename.join(' - ').replace(/\//, '⁄')}.mp3`
}
