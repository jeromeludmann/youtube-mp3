# youtube-mp3

Just a stupid wrapper based on [youtube-dl](https://github.com/rg3/youtube-dl/) and [ffmpeg](https://ffmpeg.org/).

Extract **audio only** from Youtube video.

## Install

```bash
npm install
```

## API

```javascript
import YoutubeMP3 from './youtube-mp3'

const process = new YoutubeMP3({
  youtubeUrl: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
  quality: '320k'
})

process.on('data', line => {
  console.log(line)
})

process.on('success', (filename, code) => {
  console.log(`Terminated with success: ${filename}`)
})

process.on('error', (filename, code) => {
  console.log(`Terminated with error: ${filename}`)
})

process.start()
```
