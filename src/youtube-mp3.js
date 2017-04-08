import fs from 'fs'
import url from 'url'
import EventEmitter from 'events'
import { spawn } from 'child_process'

const METADATA_ARGS = {
  'opus': '0:s:0',
  'm4a': '0'
}

export default class YoutubeMP3 extends EventEmitter {
  constructor(options) {
    super()
    if (!options.youtubeUrl) {
      throw new Error('missing attribute: youtubeUrl')
    }
    this.options = options
    this.options.id = url.parse(options.youtubeUrl, true).query.v
  }

  /**
   * Start audio extraction process
   */
  start() {
    this.downloadFromYoutube()
  }

  /**
   * Extract audio stream from Youtube video
   */
  downloadFromYoutube() {
    let extractedFile = null
    const baseFilename = `${Date.now()}${this.options.id}`

    const youtubeDlArgs = [
      '--verbose',
      '--add-metadata',
      '--extract-audio',
      // '--prefer-ffmpeg',
      // '--prefer-avconv',
      this.options.youtubeUrl,
      '-o',
      `${baseFilename}.%(ext)s`
    ]

    this.emit('data', JSON.stringify(youtubeDlArgs))

    const youtubedl = spawn('bin/youtube-dl', youtubeDlArgs)

    const onData = data => {
      const filter = '[ffmpeg] Adding metadata to'
      const line = data.toString()

      if (line.indexOf(filter) > -1) {
        extractedFile = line.slice(filter.length + 2, line.length - 2).trim()
      }

      this.emit('data', line)
    }

    const onClose = code => {
      this.convertToMp3(extractedFile, baseFilename)
    }

    youtubedl.stdout.on('data', onData)
    youtubedl.stderr.on('data', onData)
    youtubedl.on('close', onClose)
  }

  /**
   * Convert the given source file to MP3
   */
  convertToMp3(src, dest) {
    const ffmpegArgs = [
      '-loglevel', 'verbose',
      '-i', src,
      '-vn',
      '-sn',
      '-y',
      '-c:a', 'mp3'
    ]

    const extension = src.slice(src.lastIndexOf('.') + 1)
    const metadataArg = METADATA_ARGS[extension]
    if (!metadataArg) {
      throw new Error(`file extension ${extension} not found in metadata args`)
    }
    ffmpegArgs.push('-map_metadata', metadataArg)

    if (this.options.tags) {
      ffmpegArgs.push('-metadata', `title=${this.options.tags.title}`)
      ffmpegArgs.push('-metadata', `artist=${this.options.tags.artist}`)
      ffmpegArgs.push('-metadata', `album=${this.options.tags.album}`)
    }

    ffmpegArgs.push('-b:a', this.options.quality
      ? this.options.quality
      : '320k')

    if (this.options.start) {
      ffmpegArgs.push('-ss', this.options.start)
    }

    if (this.options.duration) {
      ffmpegArgs.push('-t', this.options.duration)
    }

    const filename = `${dest}.mp3`
    ffmpegArgs.push(filename)

    this.emit('data', JSON.stringify(ffmpegArgs))

    const ffmpeg = spawn('ffmpeg', ffmpegArgs)

    const onData = data => {
      const line = data.toString()
      this.emit('data', line)
    }

    const onClose = code => {
      fs.unlink(src, err => {
        if (err) {
          this.emit('error', `Error while removing temporary file: ${src}`)
        } else {
          this.emit('data', `Temporary file removed: ${src}`)
        }

        if (code !== 0) {
          this.emit('error', filename, code)
          return
        }

        this.emit('success', filename)
      })
    }

    ffmpeg.stdout.on('data', onData)
    ffmpeg.stderr.on('data', onData)
    ffmpeg.on('close', onClose)
  }
}
