import YoutubeMP3 from '../api/index'

export const getInstance = opts => {
  const instance = new YoutubeMP3(opts)

  instance.on('downloading', (videoId, outputLine) =>
    process.stdout.write(`Downloading ${videoId}: ${outputLine}`))

  instance.on('encoding', (videoId, outputLine) =>
    process.stdout.write(`Encoding ${videoId}: ${outputLine}`))

  instance.on('downloaded', (videoId, downloadedFile) =>
    process.stdout.write(`${videoId} downloaded with success: ${downloadedFile}`))

  instance.on('encoded', (videoId, encodedFile) =>
    process.stdout.write(`${videoId} encoded with success: ${encodedFile}`))

  instance.on('error', (videoId, err) =>
    process.stderr.write(err))

  return instance
}
