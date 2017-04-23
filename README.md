# youtube-mp3

Basic wrapper based on [youtube-dl](https://github.com/rg3/youtube-dl/) and [ffmpeg](https://ffmpeg.org/).

Extract **audio only** from Youtube video.

## Install

```bash
npm install
```

## API usage

```javascript
import YoutubeMP3 from './youtube-mp3'

const process = new YoutubeMP3([{
  youtubeUrl: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
  quality: '320k',
  start: '00:01:23'
},{
  youtubeUrl: 'https://www.youtube.com/watch?v=YYYYYYYYYYY',
  quality: '128k'
},{
  youtubeUrl: 'https://www.youtube.com/watch?v=ZZZZZZZZZZZ',
  quality: '256k'
}])

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

## To do

### Core

 - Add at least one unit test
 - Default parameters to avoid repeating same parameters

### Web app

 - **Need HTML/CSS parts** to use within a web app
 - Web Socket architecture (using Express/socket.io?)
 
