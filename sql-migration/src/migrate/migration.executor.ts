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
        console.info(`Currently installed version: ${versionInstalled==null ? 'NO VERSION': versionInstalled}`);

        const migrationsToPerform = this.migrationSequencer.getMigrationFrom(versionInstalled);

        if(migrationsToPerform.length>0) {
            console.debug(`Migrating from ${versionInstalled} onwards for ${migrationsToPerform.length} versions.`);
            for (const version of migrationsToPerform) {
                await this.migrateVersion(version);
            }
            return migrationsToPerform[migrationsToPerform.length - 1].version;
        }else{
            console.info(`Schema is up to date on version ${versionInstalled}. Will not perform any migrations.`);
            return versionInstalled;
        }
    }

    async migrateSingle(version: string): Promise<string> {
        const versionInstalled = await this.initialise();
        console.info(`Currently installed ${versionInstalled}`);
        const migration = this.migrationSequencer.getMigrationFrom(null).find(migration => migration.version === version);
        return this.migrateVersion(migration);
    }

    async migrateVersion(migration: Migration): Promise<string> {
        console.info(`About to migrate to ${migration.version}`);
        try {
            const results = await this.mysql.query(migration.content);
            console.debug(`Migration script executed with ${JSON.stringify(results)}`);
            const checkpoint = await this.mysql.updateVersion(migration.version);
            console.debug(checkpoint);
            console.info(`Migrated to ${migration.version}`);
        }catch (error) {
            console.error(`Failed to migrate to ${migration.version} due to ${JSON.stringify(error)}`);
        }
        return migration.version;
    }

    private async initialise(): Promise<string> {
        console.log('Initialising migration framwork');
        await this.mysql.testConnection();

        try {
            const results = await this.mysql.selectFirstVersion();
            if (results && results != null && results.length > 0) {
                return results[0]['current_version'];
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_NO_SUCH_TABLE') {
                await this.createMigrationTable();
                this.initialise();
            }
        }
    }

    private async createMigrationTable() {
        const createResult = await this.mysql.createTable();
        console.debug(JSON.stringify(createResult));
    }
}