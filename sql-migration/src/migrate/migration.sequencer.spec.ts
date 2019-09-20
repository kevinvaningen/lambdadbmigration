import {MigrationSequencer} from './migration.sequencer';
import {gt, parse} from 'semver';

describe('MigrationSequencer', () => {
    let migrationSequencer;
    const mock=[];

    beforeEach(() => {
        migrationSequencer = new MigrationSequencer();
    });

    describe('finds list of migrations', () => {
        test('find all', async () => {
            const d = migrationSequencer.getMigrationFrom(null);
            expect(d.length).toEqual(3);
        });

        test('find smaller', async () => {
            const d = migrationSequencer.getMigrationFrom('2.0.0');
            expect(d.length).toEqual(1);
        });

        test('find none if up to date', async () => {
            const d = migrationSequencer.getMigrationFrom('2.1.0');
            expect(d.length).toEqual(0);
        });
    });
});