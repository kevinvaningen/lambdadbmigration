import * as fs from 'fs';
import * as path from 'path';
import {Migration} from '../model/migration';
import {gt, parse} from 'semver';

export class MigrationSequencer {

    constructor() {
    }

    getMigrationFrom(from: string):Migration[] {
        if(!from || parse(from)==null){
            console.debug('First migration. Running all packaged migrations.');
            return this.migrations();
        }else{
            return this.migrations().filter(m => gt( m.version, from));
        }
    }

    private migrations(): Migration[] {
        const migrations: Migration[] = [];

        const directoryPath = path.normalize(__dirname + '/../migrations');
        fs.readdirSync(directoryPath).forEach(fileName => {
            const content = fs.readFileSync(directoryPath + '/' + fileName, 'utf8');
            if (content && content.length > 0) {
                migrations.push({
                    version: fileName.replace('.sql', ''),
                    content: content
                } as Migration);
            }
        });
        return migrations;
    }
}