export class Mysql{

    migrationTableName = "db_version";

    constructor(private mysql:any) {
    }

    async query(query:string) {
        return await this.mysql.query(query);
    }

    async selectFirstVersion():Promise<string[]> {
        return await this.mysql.query(`SELECT current_version from ${this.migrationTableName} where installed_rank = (select max(installed_rank) from ${this.migrationTableName})`);
    }

    async createTable() {
        await this.mysql.query(`CREATE TABLE ${this.migrationTableName} (
            installed_rank int NOT NULL AUTO_INCREMENT,
            current_version VARCHAR(255),
            version VARCHAR (255),
            PRIMARY KEY (installed_rank)
            )`);
    }

    async testConnection() {
        console.debug(JSON.stringify(await this.mysql.query('SELECT version()')));
    }

    async updateVersion(version: string) {
        await this.mysql.query(`INSERT INTO ${this.migrationTableName} `+`(current_version,version`+`) VALUES (?,now())`,[version]);
    }
}