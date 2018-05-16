import fs from 'fs'
import path from 'path'
import url from 'url'
import EventEmitter from 'events'
import rimraf from 'rimraf'

import { downloadFromYoutube } from './download'
import { encodeToMp3 } from './encode'

export default class YoutubeMP3 extends EventEmitter {
  constructor({
    output = '',
    videos = null,
    videoUrl = null,
    verbose = false
  }) {
    super(output, videos)
    this.output = output.trim()
    if (videos && videoUrl) {
      throw new Error('videos OR videoUrl should be given, not both')
    }
    this.videos = !videos || videos.length === 0 ? [{ url: videoUrl }] : videos
    this.verbose = verbose
  }

  async run() {
    let youtubeId = null
    let downloadedFile = null

    try {
      if (!fs.existsSync(this.output)) {
        fs.mkdirSync(this.output)
      }

      for (const video of this.videos) {
        video.url = video.url.trim()

        // 'youtubeId' is used as a key to identify the different slices
        // if we decide to parallelize the Youtube calls in the next releases.
        youtubeId = this.getIdFromYoutubeUrl(video.url)

        const timestamp = Date.now()

        downloadedFile = await downloadFromYoutube(
          {
            key: youtubeId,
            url: video.url,
            target: path.resolve(
              this.output,
              `tmp_${timestamp}`,
              `youtube_${youtubeId}.%(ext)s`
            ),
            verbose: this.verbose
          },
          (key, outputLine) => this.emit('downloading', key, outputLine)
        )

        this.emit('downloaded', youtubeId, downloadedFile)

        const encodedFiles = []

        // in all cases, we create at least one slice with default tags
        if (!video.slices) {
          video.slices = []
        }
        if (video.slices.length === 0) {
          const defaultSlice = {}
          defaultSlice.tags = video.tags
          video.slices.push(defaultSlice)
        }

        for (const k in video.slices) {
          const slice = video.slices[k]

          // avoid specifying "end" if the next "start" value is the same
          if (slice.end === 'next') {
            if (k < video.slices.length - 1) {
              slice.end = video.slices[Number(k) + 1].start
            } else {
              delete slice.end
            }
          }

          // inherit tags from related video/slices if needed
          video.tags = video.tags || {}
          slice.tags = slice.tags || {}
          slice.tags.artist = slice.tags.artist || video.tags.artist
          slice.tags.album = slice.tags.album || video.tags.album
          slice.tags.title = slice.tags.title || video.tags.title
          slice.tags.track = Number(k) + 1

          encodedFiles.push(
            await encodeToMp3(
              {
                key: youtubeId,
                sourceFile: downloadedFile,
                quality: video.quality,
                slice,
                target: path.resolve(
                  this.output,
                  `youtube_${youtubeId}_${timestamp}`
                ),
                withTrackNumber: video.slices.length > 1,
                verbose: this.verbose
              },
              (key, outputLine) => this.emit('encoding', key, outputLine)
            )
          )
        }

        this.emit('encoded', youtubeId, encodedFiles)

        // Remove temporary folder
        rimraf(path.resolve(this.output, `tmp_${timestamp}`), () => {
          console.log(`folder tmp_${timestamp} removed`)
        })
      }
    } catch (err) {
      this.emit('error', youtubeId, err)
    }
  }

  getIdFromYoutubeUrl(youtubeUrl) {
    return youtubeUrl.includes('youtu.be')
      ? url.parse(youtubeUrl, false).pathname.slice(1)
      : url.parse(youtubeUrl, true).query.v
  }
}
