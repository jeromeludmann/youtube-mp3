# youtubemp3

Get MP3 from Youtube videos.

## Installation

First of all, you have to install:

* [youtube-dl](https://github.com/rg3/youtube-dl/)
* [ffmpeg](https://ffmpeg.org/)
* [node.js](https://nodejs.org/) (obviously...)

Please refer to given links above in order to get these depedencies installed.

Once it's done, you can install `youtubemp3` just by typing:

```sh
npm install -g @jeromeludmann/youtubemp3
```

## Usage

#### Command Line Interface

##### Simple mode

Download the entire track in the current directory from the given Youtube URL:

```sh
youtubemp3 get https://www.youtube.com/watch?v=XXXXX
```

You can also specify an output directory like this:

```sh
youtubemp3 get https://www.youtube.com/watch?v=XXXXX $HOME/Desktop/
```

Note that it will be automatically tagged. See below for more options.

##### Advanced mode

The advanced mode allows you to slice/tag many MP3 from many Youtube videos in one shot.

It use a JSON file containing the entire description of slices/tags:

```sh
# generate a sample description file
youtubemp3 init album_description.json

# run the process of MP3 slicing
youtubemp3 slice album_description.json
```

#### API

It's recommended to install `youtubemp3` locally:

```sh
cd project/
npm i -S @jeromeludmann/youtubemp3
```

##### Simple mode

```javascript
import YoutubeMP3 from './YoutubeMP3'

const youtubeMp3 = new YoutubeMP3(
  {
    // set the output folder
    // it will be created if needed
    output: '/music/',

    // the video you want to extract (without other settings)
    videoUrl: 'https://www.youtube.com/watch?v=XXXXX'
)
```

##### Advanced mode

```javascript
import YoutubeMP3 from './YoutubeMP3'

const youtubeMp3 = new YoutubeMP3({
  // set the output folder
  // it will be created if needed
  output: '/music/',

  // all the Youtube sounds you want to extract
  videos: [
    // the simple use case
    {
      // the Youtube URL video (required)
      url: 'https://www.youtube.com/watch?v=XXXXX'
    },

    // another simple case with some optional parameters
    {
      url: 'https://www.youtube.com/watch?v=YYYYY',

      // MP3 encoding quality (optional)
      // default: 320k
      quality: '256k',

      // override the default tags (optional)
      // by default, it will extract the Youtube video tags
      // no effects with a given slices[] attribute
      tags: {
        artist: 'XXXXX',
        album: 'YYYYY',
        title: 'ZZZZZ'
      }
    },

    // advanced use with given slices
    {
      url: 'https://www.youtube.com/watch?v=ZZZZZ',

      // default tags used by following slices
      tags: {
        artist: 'XXXXX',
        album: 'YYYYY'
      },

      // all the parts you want to slice (optional)
      slices: [
        // first slice
        {
          // the start of the slice (optional)
          // default: start of the video
          start: '00:00:00',

          // the end of this slice (optional)
          // 'next' reference the start value of the next slice
          // default: end of the video
          end: 'next'
        },

        // second slice
        {
          start: '00:01:23',
          end: '00:02:34',

          // rewrite the tags for this slice (optional)
          // inherit from default tags
          tags: {
            title: 'ZZZZZ'
          }
        }

        // ... all the other slices you want
      ]
    }

    // ... and all the other Youtube sounds you need
  ]
})
```

and handle events as usual:

```javascript
youtubeMp3.on('downloading', (videoId, outputLine) => {
  console.log(`Downloading Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeMp3.on('encoding', (videoId, outputLine) => {
  console.log(`Encoding Youtube video ID ${videoId}: ${outputLine}`)
})

youtubeMp3.on('downloaded', (videoId, success) => {
  console.log(`Youtube video ID ${videoId} downloaded with success`)
})

youtubeMp3.on('encoded', (videoId, success) => {
  console.log(`Youtube video ID ${videoId} encoded with success`)
})

youtubeMp3.on('error', (videoId, err) => {
  console.error(err)
})

youtubeMp3.run()
```
