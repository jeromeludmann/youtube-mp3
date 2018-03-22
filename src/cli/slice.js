import { getInstance } from './helpers'

export default {
  command: 'slice <source> [destination]',
  aliases: ['s'],
  describe: 'Slice MP3(s) from a fullfilled file',
  builder: yargs =>
    yargs.default(
      'destination',
      process.cwd()
    ),
  handler: argv => {
    getInstance({
      videos: getVideosFromSource(argv.source),
      output: argv.destination,
      verbose: argv.verbose
    }).run()
  }
}

const getVideosFromSource = source =>
  require(
    source.startsWith('/')
      ? source
      : process.cwd() + '/' + source
  ).videos
