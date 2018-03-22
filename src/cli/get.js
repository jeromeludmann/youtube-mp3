import { getInstance } from './helpers'

export default {
  command: 'get <source> [destination]',
  aliases: ['g'],
  describe: 'Get an entire MP3 from a Youtube URL',
  builder: yargs =>
    yargs.default(
      'destination',
      process.cwd()
    ),
  handler: argv =>
    getInstance({
      videoUrl: argv.source,
      output: argv.destination,
      verbose: argv.verbose
    }).run()
}
