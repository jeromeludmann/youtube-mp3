# Youtube MP3 Slicer

Youtube downloader/MP3 encoder wrapper based on [youtube-dl](https://github.com/rg3/youtube-dl/) and [ffmpeg](https://ffmpeg.org/).

Get and slice MP3 (audio only) from Youtube videos.

**Need front-end with HTML/CSS/VueJS/whatever**

## Install

```bash
npm install
```

## API usage

```javascript
import YoutubeSlicer from './YoutubeSlicer'

const youtubeSlicer = new YoutubeSlicer(
  // set the output folder
  // it will be created if needed
  '/music/',
  
  // all the Youtube sounds you want to extract
  [
    // the simple use case
    {
      // the Youtube URL video (required)
      url: 'https://www.youtube.com/watch?v=XXXXX'
    },

    // another simple case with some optional parameters
    {
      url: 'https://www.youtube.com/watch?v=YYYYY',

      // MP3 encoding quality (optional)
      // default to 320k
      quality: '256k',

      // override the default tags (optional)
      // by default, it will extract the Youtube video tags
      // no effects with a given slices[] attribute
      tags: {
        artist: 'XXXXX',
        title: 'YYYYY',
        album: 'ZZZZZ'
      }
    },

    // advanced use with given slices
    {
      url: 'https://www.youtube.com/watch?v=ZZZZZ',

      // all the parts you want to slice (optional)
      slices: [
        // first slice
        {
          // the start of the slice (optional)
          start: '00:00:00',

          // the end of this slice (optional)
          // 'next' reference the start value of the next slice
          end: 'next'
        },

        // second slice
        {
          start: '00:01:23',
          end: '00:02:34',
          
          // rewrite the tags for this slice (optional)
          tags: {
            artist: 'XXXXX',
            title: 'YYYYY',
            album: 'ZZZZZ'
          }
        },
        
        // ... all the other slices you want
      ]
    },

    // ... and all the other Youtube sounds you need
  ]
)

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
