import fs from 'fs'
import url from 'url'
import path from 'path'
import EventEmitter from 'events'
import { spawn } from 'child_process'

const METADATA_ARGS = {
  'opus': '0:s:0',
  'm4a': '0',
  'ogg': '0:s:0'
}

export default class YoutubeMP3 extends EventEmitter {
  constructor(params) {
    super(params)
    this.params = params
  }

  /**
   * Start audio extraction process
   */
  async start() {
    for (const param of this.params) {
      await this.downloadFromYoutube(param)
    }
  }

  /**
   * Extract audio stream from Youtube video
   */
  downloadFromYoutube(param) {
    return new Promise((resolve, reject) => {
      let extractedFile = null
      const baseFilename = `${Date.now()}_${url.parse(param.youtubeUrl, true).query.v}`

      const youtubeDlArgs = [
        '--verbose',
        '--add-metadata',
        '--extract-audio',
        // '--prefer-ffmpeg',
        // '--prefer-avconv',
        param.youtubeUrl,
        '-o',
        `${baseFilename}.%(ext)s`
      ]

      this.emit('data', JSON.stringify(youtubeDlArgs))

      const youtubedl = spawn(path.resolve(__dirname, '..', 'bin', 'youtube-dl'), youtubeDlArgs)

      const onData = data => {
        const filter = '[ffmpeg] Adding metadata to'
        const line = data.toString()

        if (line.indexOf(filter) > -1) {
          extractedFile = line.slice(filter.length + 2, line.length - 2).trim()
        }

        this.emit('data', line)
      }

      const onClose = code => {
        resolve(this.convertToMp3(param, extractedFile, baseFilename))
      }

      youtubedl.stdout.on('data', onData)
      youtubedl.stderr.on('data', onData)
      youtubedl.on('close', onClose)
    })
  }

  /**
   * Convert the given source file to MP3
   */
  convertToMp3(param, src, dest) {
    return new Promise((resolve, reject) => {
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

      if (param.tags) {
        ffmpegArgs.push('-metadata', `title=${param.tags.title}`)
        ffmpegArgs.push('-metadata', `artist=${param.tags.artist}`)
        ffmpegArgs.push('-metadata', `album=${param.tags.album}`)
      }

      ffmpegArgs.push('-b:a', param.quality
        ? param.quality
        : '320k')

      if (param.start) {
        ffmpegArgs.push('-ss', param.start)
      }

      if (param.duration) {
        ffmpegArgs.push('-t', param.duration)
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
            reject(new Error(code))
            return
          }

          this.emit('success', filename)
          resolve(filename)
        })
      }

      ffmpeg.stdout.on('data', onData)
      ffmpeg.stderr.on('data', onData)
      ffmpeg.on('close', onClose)
    })
  }
}
