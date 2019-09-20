import {MigrationSequencer} from '../migrate/migration.sequencer';
import {Migration} from '../model/migration';
import {Mysql} from '../db/mysql';

export class MigrationExecutor {

    constructor(
        private mysql: Mysql,
        private migrationSequencer: MigrationSequencer) {
    }

    async migrate(): Promise<string> {
        const versionInstalled = await this.initialise();
        console.info(`Currently installed version: ${versionInstalled === null ? 'NO VERSION' : versionInstalled}`);

        const migrationsToPerform = this.migrationSequencer.getMigrationFrom(versionInstalled);

        if (migrationsToPerform.length > 0) {
            console.debug(`Migrating from ${versionInstalled} onwards for ${migrationsToPerform.length} versions.`);
            for (const version of migrationsToPerform) {
                await this.migrateAndCheckpoint(version);
            }
            return migrationsToPerform[migrationsToPerform.length - 1].version;
        } else {
            console.info(`Schema is up to date on version ${versionInstalled}. Will not perform any migrations.`);
            return versionInstalled;
        }
    }

    async migrateSingleVersion(version: string): Promise<string> {
        const versionInstalled = await this.initialise();
        console.info(`Currently installed ${versionInstalled}`);
        const migrationToBeExecuted = this.migrationSequencer.getMigrationFrom(null).find(migration => migration.version === version);
        await this.migrateVersion(migrationToBeExecuted);
        return version;
    }

    async migrateAndCheckpoint(migration: Migration): Promise<string> {
        try {
            await this.migrateVersion(migration);
            const checkpoint = await this.mysql.updateVersion(migration.version);
            console.debug(checkpoint);
            console.info(`Migrated to ${migration.version}`);
        } catch (error) {
            console.error(`Failed to migrate to ${migration.version} due to ${JSON.stringify(error)}`);
        }
        return migration.version;
    }

    private async migrateVersion(migration: Migration) {
        console.info(`About to migrate to ${migration.version}`);
        const results = await this.mysql.query(migration.content);
        console.debug(`Migration script executed with ${JSON.stringify(results)}`);
    }

    private async initialise(): Promise<string> {
        console.log('Initialising migration framework');
        await this.mysql.testConnection();

        try {
            const results = await this.mysql.selectFirstVersion();
            if (results && results.length > 0) {
                return results[0]['current_version'];
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_NO_SUCH_TABLE') {
                await this.createMigrationTable();
                await this.initialise();
            }
        }
    }

    private async createMigrationTable() {
        const createResult = await this.mysql.createTable();
        console.debug(JSON.stringify(createResult));
    }
}