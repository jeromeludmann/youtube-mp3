# youtube-mp3

Youtube downloader/MP3 encoder wrapper based on [youtube-dl](https://github.com/rg3/youtube-dl/) and [ffmpeg](https://ffmpeg.org/).

Extract **audio only** from Youtube video.

## Install

```bash
npm install
```

## API usage

```javascript
import YoutubeMP3 from './youtube-mp3'

const youtubeMp3 = new YoutubeMP3([
  {
    url: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
    options: {
      quality: '320k'
    },

    // NOT YET IMPLEMENTED
    parts: [
      {
        start: '00:01:23',
        duration: '00:15:30',
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
    },
  }
])

youtubeMp3.on('downloading', (videoId, outputLine) => {
  console.log(`Downloading Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeMp3.on('encoding', (videoId, outputLine) => {
  console.log(`Encoding Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeMp3.on('downloaded', (videoId, success) => {
  if (!success) {
    console.error(`Error while downloading Youtube video ID ${videoId}`)
  } else {
    console.log(`Youtube video ID ${videoId} downloaded with success`)
  }
})

youtubeMp3.on('encoded', (videoId, success) => {
  if (!success) {
    console.error(`Error while encoding Youtube video ID ${videoId}`)
  } else {
    console.log(`Youtube video ID ${videoId} encoded with success`)
  }
})

youtubeMp3.start()
```

## To do

### Core

 - Develop "parts" feature
 - Add at least one unit test

### Web app

 - **Need HTML/CSS parts** to use within a web app (why does not use Vue.js?)
 - Web Socket architecture (using Express/socket.io?)
 
