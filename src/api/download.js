import path from 'path'
import { spawn } from 'child_process'
import url from 'url'

export function downloadFromYoutube({ key, url, target, verbose = false }, callback) {
  return new Promise((resolve, reject) => {
    let extractedFile = null

    const youtubeDlArgs = [
      '-f', 'bestaudio',
      '--add-metadata',
      '--extract-audio',
      '-k',
      rebuildUrl(url),
      '-o',
      target
    ]

    if (verbose) {
      youtubeDlArgs.push('--verbose')
    }

    const youtubedl = spawn(path.resolve(__dirname, '..', '..', 'bin', 'youtube-dl'), youtubeDlArgs)

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

const rebuildUrl = urlString => {
  const { protocol, host, pathname, query } = url.parse(urlString, true)
  return `${protocol}//${host}${pathname}?v=${query.v}`
}
