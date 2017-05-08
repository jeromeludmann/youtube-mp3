import fs from 'fs'
import url from 'url'
import EventEmitter from 'events'

import { downloadFromYoutube } from './download'
import { encodeToMp3 } from './encode'

export default class YoutubeSlicer extends EventEmitter {
  constructor(videos) {
    super(videos)
    this.videos = videos
  }

  async run() {
    let youtubeId = null
    let downloadedFile = null

    try {
      for (const video of this.videos) {
        // 'videoId' is used as a key to determinate the different slices
        // if we parallelize the Youtube calls in the future.
        youtubeId = url.parse(video.url, true).query.v

        downloadedFile = await downloadFromYoutube({
          key: youtubeId,
          url: video.url
        },
          (key, outputLine) => this.emit('downloading', key, outputLine))

        this.emit('downloaded', youtubeId, downloadedFile)

        const encodedFiles = []

        if (!video.slices || video.slices.length === 0) {
          encodedFiles.push(await encodeToMp3({
            key: youtubeId,
            sourceFile: downloadedFile,
            params: video.params
          }, (key, outputLine) => this.emit('encoding', key, outputLine)))
        } else {
          for (const k in video.slices) {
            const slice = video.slices[k]

            // avoid specifying "end" if the next "start" value is the same
            if (slice.end === 'next') {
              slice.end = video.slices[Number(k) + 1].start
            }

            if (!slice.tags) {
              slice.tags = {}
            }

            slice.tags.track = Number(k) + 1

            encodedFiles.push(await encodeToMp3({
              key: youtubeId,
              sourceFile: downloadedFile,
              params: video.params,
              slice
            }, (key, outputLine) => this.emit('encoding', key, outputLine)))
          }

          this.emit('encoded', youtubeId, encodedFiles)
        }
      }
    } catch (err) {
      this.emit('error', youtubeId, err)
    } finally {
      // Remove temporary downloaded file
      fs.unlink(downloadedFile, err => {
        if (err) {
          console.error(`Error while removing temporary file: ${sourceFile}`)
        }
      })
    }
  }
}
