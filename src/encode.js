import { spawn } from 'child_process'

const DEFAULT_QUALITY = '320k'

const METADATA_ARGS = {
  'opus': '0:s:0',
  'm4a': '0',
  'ogg': '0:s:0'
}

export function encodeToMp3({ key, sourceFile, params = {}, slice = { tags: {} } }, callback) {
  return new Promise((resolve, reject) => {
    const args = getArguments(key, sourceFile, params.quality, slice)
    const filename = generateFilename(key, slice)
    args.push(filename)

    const ffmpeg = spawn('ffmpeg', args)

    const onData = data => {
      callback(key, data.toString())
    }

    const onClose = code => {
      if (code === 0) {
        resolve(filename)
      } else {
        reject(new Error(`Error while encoding Youtube video ID: ${key}`))
      }
    }

    ffmpeg.stdout.on('`dat`a', onData)
    ffmpeg.stderr.on('data', onData)
    ffmpeg.on('close', onClose)
  })
}

function getArguments(key, sourceFile, quality, slice) {
  const ffmpegArgs = [
    // '-loglevel', 'verbose',
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
    ffmpegArgs.push('-ss', slice.start)
  }

  if (slice.end) {
    ffmpegArgs.push('-to', slice.end)
  }

  if (slice.duration) {
    ffmpegArgs.push('-t', slice.duration)
  }

  return ffmpegArgs
}

function generateFilename(key, slice) {
  let filename = ''

  if (slice.tags.artist) {
    filename = slice.tags.artist
  } else {
    filename = `_${key}`
  }

  if (slice.tags.track) {
    filename = `${filename} - ${`0${slice.tags.track}`.slice(-2)}`
  }

  if (slice.tags.title) {
    filename = `${filename} - ${slice.tags.title}`
  } else if (slice.tags.start) {
    filename = `${filename} - ${slice.start.replace(/:/g, '')}`
  }

  return `${filename}.mp3`
}
