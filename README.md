# Lambda RDS MySQL Migration utility
This project is a fully functional 'prototype' which you an use to fix your RDS (specifically MySQL) SQL migrations in your Lambda environment. 
It is designed in the spirit of Flyway (a popular Java sql migration tool) but it's still in infancy. 

## Workings
On initial load the existence of a schema version table is assessed. When none is found a new table (db_version) is created and migrations will afterwards be kicked off. 

Each database version is represented by a semantic version like 1.0.0.sql. These versions are listed and executed sequentially. When the current schema is already migrated (lets say halfway a list of migrations) the remainder of the sequence is executed.  

## Feature support
- Incremental migrations based on .sql files in the migrations folder, with file named based on semver. 
- Creates an innital version meta table (called db_version)
- Executes migrations in sequence from none (or current version from a previous migration).
- Is able to execute a single file again by providing a single version string. 

## Extendability to other RDS databases 
Other db's are easily supported. Just import the proper driver in the npm dependencies and modify the mysql.ts with your new database queries and  update the triggers/migrate.ts with new connection params.   

## Installing and using
Copy sources and modify environment variables and migration scripts for your own needs.
Open parameter store (in ec2 in console) and add parameters for RDS access:

- QS_RDS_USERNAME
- QS_RDS_ENDPOINT
- QS_RDS_DATABASE
- QS_RDS_PASSWORD (as secure param)
- QS_RDS_PORT 

Then in console (of cli) invoke the Lambda and installation of the db_version is kicked off. 

Alternatively you can provide a version argument like this:
```
{
version: '1.0.0'
}
```

This is executed as a single SQL migration. 
