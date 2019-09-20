import {MigrationExecutor} from './migration.executor';
import {JestMock, testResolve} from '../jest.util';
import {Mysql} from '../db/mysql';
import {MigrationSequencer} from './migration.sequencer';

describe('MigrationExecutor', () => {
    let migrationExecutor;
    let mysqlMock: JestMock<Mysql>;
    let migrationSequencerJestMock: JestMock<MigrationSequencer>;

    beforeEach(() => {
        mysqlMock = new JestMock('createTable','testConnection','selectFirstVersion','query');
        mysqlMock.fn.selectFirstVersion.mockReturnValue(testResolve([{current_version:"1.0.0"}]));

        migrationSequencerJestMock = new JestMock<MigrationSequencer>('getMigrationFrom');
        migrationSequencerJestMock.fn.getMigrationFrom.mockReturnValue([
            {
                version:'2.0.0',
                content:'sql migration 2.0.0'
            },
            {
                version:'3.0.0',
                content:'sql migration 3.0.0'
            },
            {
                version:'3.0.1',
                content:'sql migration 3.0.1'
            }
        ]);

        migrationExecutor = new MigrationExecutor(mysqlMock.typed, migrationSequencerJestMock.typed);
    });

    describe('migrations', () => {
        test('migrates', async () => {
            await migrationExecutor.migrate();
            expect(migrationSequencerJestMock.fn.getMigrationFrom).toHaveBeenCalledWith("1.0.0");
            expect(mysqlMock.fn.query).toHaveBeenCalledTimes(3);
            expect(mysqlMock.fn.query).toHaveBeenCalledWith("sql migration 2.0.0");
            expect(mysqlMock.fn.query).toHaveBeenCalledWith("sql migration 3.0.0");
            expect(mysqlMock.fn.query).toHaveBeenCalledWith("sql migration 3.0.1");
        });

        test('creates table', async () => {
            mysqlMock = new JestMock('createTable','testConnection','selectFirstVersion','query');
            mysqlMock.fn.selectFirstVersion.mockRejectedValueOnce({code:'ER_NO_SUCH_TABLE'});
            migrationExecutor = new MigrationExecutor(mysqlMock.typed, migrationSequencerJestMock.typed);

            await migrationExecutor.migrate();
            expect(mysqlMock.fn.createTable).toHaveBeenCalled();
        });
    });
});