import { CommandModule } from 'yargs'
import * as status from 'node-status';
import { readManifest } from './manifest'
import Result from './monad/result'
import * as chalk from 'chalk'

export const cloneCommand: CommandModule = {
    command: 'clone',
    describe: 'Clone a group of repositories from a manifest',
    builder: (_yargs) => {
        return _yargs
    },
    handler: runClone
}

function panic<T>(res: Result<T>): T {
    if (res.isOk()) { return res.value }
    else {
        const err = res.err().unwrap();
        console.error(err);
        process.exit(1);
        
        return null as any;
    }
}

export function runClone(_args: any) {
    const console = status.console();
    console.log('Starting to clone repositories.\n');

    const job = status.addItem('job', {
        steps: [
            'Read manifest file',
        ]
    });

    status.start({ pattern: '{spinner.cyan} {job.step} {job}' });

    const manifestResult = readManifest()
    job.doneStep(manifestResult.isOk())

    const manifest = panic(manifestResult)
    status.stop()

}