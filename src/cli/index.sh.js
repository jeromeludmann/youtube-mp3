#!/usr/bin/env node

import yargs from 'yargs';

import get from './get'
import slice from './slice'
import init from './init'

const argv = yargs
  .command(get)
  .command(slice)
  .command(init)
  .options({
    verbose: {
      alias: 'v',
      describe: 'Enable verbose mode',
      type: 'boolean'
    }
  })
  .demandCommand()
  .help()
  .argv
