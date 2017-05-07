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

const DEFAULT_QUALITY = '320k'

export default class YoutubeMP3 extends EventEmitter {
  constructor(videos) {
    super(videos)
    this.videos = videos
  }

  /**
   * Start audio extraction process by running tasks ('videos') sequentially
   */
  async start() {
    for (const video of this.videos) {
      // 'videoId' is used as a key to determinate the different parts
      // if we parallelize the Youtube calls in the future.
      const youtubeId = url.parse(video.url, true).query.v

      const downloadedFile = await this.downloadFromYoutube({
        key: youtubeId,
        url: video.url
      })

      const encodedFile = await this.convertToMp3({
        key: youtubeId,
        sourceFile: downloadedFile,
        options: video.options,
        parts: video.parts // TODO next step: video parts management
      })
    }
  }

  /**
   * Extract audio stream from Youtube video
   */
  downloadFromYoutube({ key, url }) {
    return new Promise((resolve, reject) => {
      let extractedFile = null
      const targetFileBaseName = `${key}`

      const youtubeDlArgs = [
        '--verbose',
        '--add-metadata',
        '--extract-audio',
        // '--prefer-ffmpeg',
        // '--prefer-avconv',
        url,
        '-o',
        `${targetFileBaseName}.%(ext)s`
      ]

      this.emit('data', JSON.stringify(youtubeDlArgs))

      const youtubedl = spawn(path.resolve(__dirname, '..', 'bin', 'youtube-dl'), youtubeDlArgs)

      const onData = data => {
        const filter = '[ffmpeg] Adding metadata to'
        const outputLine = data.toString()

        if (outputLine.indexOf(filter) > -1) {
          extractedFile = outputLine.slice(filter.length + 2, outputLine.length - 2).trim()
        }

        this.emit('downloading', key, outputLine)
      }

      const onClose = code => {
        this.emit('downloaded', key, code === 0)
        resolve(extractedFile)
      }

      youtubedl.stdout.on('data', onData)
      youtubedl.stderr.on('data', onData)
      youtubedl.on('close', onClose)
    })
  }

  /**
   * Convert the source file to MP3 part(s)
   *
   * If no specific part is given in the 'options' object,
   * only one global part will be generated.
   */
  convertToMp3({ key, sourceFile, options = {}, parts = [] }) {
    return new Promise((resolve, reject) => {
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

      // for (const part of parts) { }

      ffmpegArgs.push('-b:a', options.quality
        ? options.quality
        : DEFAULT_QUALITY)

      // if (part.tags) {
      //   ffmpegArgs.push('-metadata', `title=${options.tags.title}`)
      //   ffmpegArgs.push('-metadata', `artist=${options.tags.artist}`)
      //   ffmpegArgs.push('-metadata', `album=${options.tags.album}`)
      // }

      // if (part.start) {
      //   ffmpegArgs.push('-ss', options.start)
      // }

      // TODO convert duration to 'end' position instead      
      // if (part.duration) {
      //   ffmpegArgs.push('-t', options.duration)
      // }

      const filename = `${key}_${Date.now()}.mp3`
      ffmpegArgs.push(filename)

      this.emit('data', JSON.stringify(ffmpegArgs))

      const ffmpeg = spawn('ffmpeg', ffmpegArgs)

      const onData = data => {
        const outputLine = data.toString()
        this.emit('encoding', key, outputLine)
      }

      const onClose = code => {
        // Remove temporary file
        fs.unlink(sourceFile, err => {
          if (err) {
            console.error(`Error while removing temporary file: ${sourceFile}`)
          }
        })

        this.emit('encoded', key, code === 0)

        if (code === 0) {
          resolve(filename)
        } else {
          reject(new Error(code))
        }
      }

      ffmpeg.stdout.on('data', onData)
      ffmpeg.stderr.on('data', onData)
      ffmpeg.on('close', onClose)
    })
  }
}
