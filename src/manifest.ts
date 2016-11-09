import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'js-yaml';
import Result from './monad/result';

export interface Manifest {
    repos: RepoManifest[]
}

export interface RepoManifest {
    git: string
    path?: string
}

export function readManifest(fileName?: string): Result<Manifest> {
    if (!fileName) {
        fileName = path.join(process.cwd(), 'manyrepo.yml')
    }
    try {
        if (fs.existsSync(fileName)) {
            return Result.ok(YAML.load(fs.readFileSync(fileName).toString()))
        } else {
            return Result.err<Manifest>(new Error(`No manifest file in ${fileName}`))
        }
    } catch (e) {
        return Result.err<Manifest>(e);
    }
}
