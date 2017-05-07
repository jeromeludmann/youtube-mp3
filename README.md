# Youtube Slicer

Youtube downloader/MP3 encoder wrapper based on [youtube-dl](https://github.com/rg3/youtube-dl/) and [ffmpeg](https://ffmpeg.org/).

Get and slice **audio only** from Youtube videos.

## Install

```bash
npm install
```

## API usage

```javascript
import YoutubeSlicer from './YoutubeSlicer'

const youtubeSlicer = new YoutubeSlicer([
  {
    url: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
    options: {
      quality: '320k'
    },
    parts: [
      {
        start: '00:01:23',
        duration: '00:15:30', // temporary feature (will be improved)
        tags: {
          artist: 'XXXXX',
          title: 'YYYYY',
          album: 'ZZZZZ'
        }
      }
    ]
  },
  {
    url: 'https://www.youtube.com/watch?v=YYYYYYYYYYY',
    options: {
      quality: '128k'
    },
  },
  {
    url: 'https://www.youtube.com/watch?v=ZZZZZZZZZZZ',
    options: {
      quality: '256k'
    }
  }
])

youtubeSlicer.on('downloading', (videoId, outputLine) => {
  console.log(`Downloading Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeSlicer.on('encoding', (videoId, outputLine) => {
  console.log(`Encoding Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeSlicer.on('downloaded', (videoId, success) => {
  console.log(`Youtube video ID ${videoId} downloaded with success`)
})

youtubeSlicer.on('encoded', (videoId, success) => {
  console.log(`Youtube video ID ${videoId} encoded with success`)
})

youtubeSlicer.on('error', (videoId, err) => {
  console.error(err)
})

youtubeSlicer.run()
```

## To do

### Core

 - Add at least one unit test

### Web app

 - **Need HTML/CSS parts** to use within a web app (why does not use Vue.js?)
 - Web Socket architecture (using Express/socket.io?)
 
