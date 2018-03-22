import { cp } from 'shelljs'

const DEFAULT_GENERATED_FILENAME = 'slices'

export default {
  command: 'generate [destination]',
  describe: 'Generate a ready to fill slices file',
  builder: {
    destination: '.'
  },
  handler: argv => {
    cp(
      `${__dirname}/../../example.json`,
      argv.destination || `${process.cwd()}/${DEFAULT_GENERATED_FILENAME}-${Date.now()}.json`
    )
  }
}
