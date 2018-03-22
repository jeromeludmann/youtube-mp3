#!/usr/bin/env node

import path from 'path'
import YoutubeToMP3 from './index'
import yargs from 'yargs';
import shell from 'shelljs'
import { bin } from '../package.json'

const argv = yargs
  .usage(`Usage: ${Object.keys(bin)[0]} --input <http://url|file.json> [--output <directory>]`)
  .options({
    input: {
      alias: 'i',
      describe: 'Set the Youtube URL or fullfilled JSON file',
      type: 'string',
      requiresArg: true
    },
    output: {
      alias: 'o',
      default: '.',
      describe: 'Set the output MP3 directory',
      type: 'string',
      requiresArg: true
    },
    generate: {
      alias: 'g',
      describe: 'Generate a ready to fill JSON file',
      type: 'boolean'
    },
    verbose: {
      alias: 'v',
      describe: 'Enable verbose mode',
      type: 'boolean'
    }
  })
  .argv;

if (argv.generate) {
  // copy
  shell.cp(`${__dirname}/../example.json`, process.cwd())
  process.exit(0)
}

const opts = {
  output: argv.output,
  verbose: argv.verbose
}

if (/^https?:\/\//.test(argv.input)) {
  opts.videoUrl = argv.input
} else {
  opts.videos = require(process.cwd() + '/' + argv.input).videos
}

const youtubeToMp3 = new YoutubeToMP3(opts)

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
