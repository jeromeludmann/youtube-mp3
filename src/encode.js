import { spawn } from 'child_process'

const DEFAULT_QUALITY = '320k'

const METADATA_ARGS = {
  'opus': '0:s:0',
  'm4a': '0',
  'ogg': '0:s:0'
}

export function encodeToMp3({ key, sourceFile, params = {}, slice = {} }, callback) {
  return new Promise((resolve, reject) => {
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

    ffmpegArgs.push('-b:a', params.quality
      ? params.quality
      : DEFAULT_QUALITY)

    if (slice.tags) {
      ffmpegArgs.push('-metadata', `title=${slice.tags.title}`)
      ffmpegArgs.push('-metadata', `artist=${slice.tags.artist}`)
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

    let filename = key
    if (slice.start) {
      filename = `${filename}_${slice.start.replace(/:/g, '')}`
    }
    filename = `${filename}.mp3`

    ffmpegArgs.push(filename)

    const ffmpeg = spawn('ffmpeg', ffmpegArgs)

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

    ffmpeg.stdout.on('data', onData)
    ffmpeg.stderr.on('data', onData)
    ffmpeg.on('close', onClose)
  })
}
