import {Handler} from 'aws-lambda';
import {MigrationExecutor} from '../migrate/migration.executor';
import {MigrationSequencer} from '../migrate/migration.sequencer';
import {Mysql} from '../db/mysql';

const mysql = require('serverless-mysql')({
    config: {
        host: process.env.ENDPOINT,
        database: process.env.DATABASE,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        port: process.env.PORT,
        multipleStatements:true
    }
});

export const migrate: Handler = async (event) => {
    const migrationSequencer = new MigrationSequencer();
    const mysqlConnection = new Mysql(mysql);

    const migration = new MigrationExecutor(mysqlConnection,migrationSequencer);

    if(event.version){
        return await migration.migrateSingle(event.version);
    }else{
        return await migration.migrate();
    }
};
