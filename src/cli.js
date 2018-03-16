#!/usr/bin/env node

import path from 'path'
import YoutubeToMP3 from './index'
import yargs from 'yargs';
import { bin } from '../package.json'

const argv = yargs
  .usage(`Usage: ${Object.keys(bin)[0]} -u <youtube url> [-o <output directory>]`)
  .options({
    url: {
      alias: 'u',
      demand: true,
      describe: 'Youtube URL',
      demandOption: true,
      type: 'string',
      requiresArg: true
    },
    output: {
      alias: 'o',
      default: '.',
      describe: 'Output directory',
      type: 'string',
      requiresArg: true
    },
    verbose: {
      alias: 'v',
      describe: 'Verbose mode',
      type: 'boolean'
    }
  })
  .argv;

const youtubeToMp3 = new YoutubeToMP3({
  output: argv.output,
  videoUrl: argv.url,
  verbose: argv.verbose
})

youtubeToMp3.on('downloading', (videoId, outputLine) =>
  process.stdout.write(`Downloading ${videoId}: ${outputLine}`))

youtubeToMp3.on('encoding', (videoId, outputLine) =>
  process.stdout.write(`Encoding ${videoId}: ${outputLine}`))

youtubeToMp3.on('downloaded', (videoId, downloadedFile) =>
  process.stdout.write(`${videoId} downloaded with success: ${downloadedFile}`))

youtubeToMp3.on('encoded', (videoId, encodedFile) =>
  process.stdout.write(`${videoId} encoded with success: ${encodedFile}`))

youtubeToMp3.on('error', (videoId, err) =>
  process.stderr.write(err))

youtubeToMp3.run()
