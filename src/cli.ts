import * as yargs from 'yargs'
import { cloneCommand } from './clone'

yargs
    .command(cloneCommand)
    .help('h')
    .argv;