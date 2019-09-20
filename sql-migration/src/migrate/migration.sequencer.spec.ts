import {MigrationSequencer} from './migration.sequencer';

describe('MigrationSequencer', () => {
    let migrationSequencer;

    beforeEach(() => {
        migrationSequencer = new MigrationSequencer();
    });

    describe('finds list of migrations', () => {
        test('find all', async () => {
            const d = migrationSequencer.getMigrationFrom(null);
            expect(d.length).toEqual(4);
        });

        test('find smaller', async () => {
            const d = migrationSequencer.getMigrationFrom('2.0.0');
            expect(d.length).toEqual(2);
        });

        test('find none if up to date', async () => {
            const d = migrationSequencer.getMigrationFrom('3.0.1');
            expect(d.length).toEqual(0);
        });
    });
});