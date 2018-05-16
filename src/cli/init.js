import { cp } from 'shelljs'

const DEFAULT_INITIALIZED_FILENAME = 'slices'

export default {
  command: 'init [destination]',
  aliases: ['i'],
  describe: 'Initialize a ready to fill JSON file',
  builder: yargs =>
    yargs.default(
      'destination',
      `${process.cwd()}/${DEFAULT_INITIALIZED_FILENAME}-${Date.now()}.json`
    ),
  handler: argv => {
    const destination = addMissingJsonSuffix(argv.destination)

    const { code } = cp(
      `${__dirname}/../../slice-desc-sample.json`,
      destination
    )

    if (code === 0) {
      process.stdout.write(`${destination} has been successfully created\n`)
    } else {
      process.stderr.write(`Error while creating ${destination}: ${code}\n`)
    }
  }
}

const addMissingJsonSuffix = path =>
  path.endsWith('.json') ? path : `${path}.json`
