import path from 'path'
import { spawn } from 'child_process'

export function downloadFromYoutube({ key, url, target }, callback) {
  return new Promise((resolve, reject) => {
    let extractedFile = null

    const youtubeDlArgs = [
      // '--verbose',
      '-f', 'bestaudio',
      '--add-metadata',
      '--extract-audio',
      // '--prefer-ffmpeg',
      // '--prefer-avconv',
      '-k',
      url,
      '-o',
      target
    ]

    const youtubedl = spawn(path.resolve(__dirname, '..', 'bin', 'youtube-dl'), youtubeDlArgs)

    const onData = data => {
      const filter = '[ffmpeg] Adding metadata to'
      const outputLine = data.toString()

      if (outputLine.indexOf(filter) > -1) {
        extractedFile = outputLine.slice(filter.length + 2, outputLine.length - 2).trim()
      }

      callback(key, outputLine)
    }

    const onClose = code => {
      if (code !== 0) {
        console.error(`Error while downloading Youtube video ID: ${key}`)
      }

      resolve(extractedFile)
    }

    youtubedl.stdout.on('data', onData)
    youtubedl.stderr.on('data', onData)
    youtubedl.on('close', onClose)
  })
}
