'use strict'
require('require-yaml');
const Promise = require('bluebird');
const fs = require('fs');
const exec = require('child-process-promise').exec;

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

const dynamodbutilities = global.routes.include('lib', 'dynamodb-utilities.js');
const retryCount = 25;

class DynamoDeployTables {
    constructor(){}

    deployTable(tableFileName, env, region, counter) {
        let executionCount = counter || 0;
        let tableName = this.getTableName(tableFileName);

        return exec(`serverless dynamodb execute -s ${env} -n ${tableFileName} -r ${region}`)
        .then(() => {
            return tableName;
        })
        .then(this.waitForCreation.bind(this))
        .then(() => {
            let val = `Successfully created ${tableName}`;

            du.highlight(val);
            return val;
        })
        .catch((err) => {
            if (executionCount++ < retryCount) {
                return this.deployTable(tableFileName, env, region, executionCount)
            } else {
                let val = `Failed to create ${tableName}`;

                du.error(val);
                du.debug(err);

                return val;
            }
        });
    }

    deployAll(env, region) {
        let tables = this.getMigrationFileNames(env);

        return Promise.map(tables, (table) => {
            return this.deployTable(table, env, region);
        }, {concurrency: 7})
        .then((vals) => {
            du.debug(vals);
            return vals;
        })
        .catch((vals) => {
            du.error(vals);
            return vals;
        })
    }

    deleteTable(tableName){
	      return new Promise((resolve, reject) => {
		        dynamodbutilities.deleteTable(tableName, () => {
			          this.waitForDeletion(tableName)
                .then(resolve)
                .catch(reject);
		        });
	      })
        .then(() => {
            let val = `Deletion completed for ${tableName}`;

            du.highlight(val);
            return val;
        })
        .catch((err) => {
            let val = `Failed to delete: ${tableName}`;

            du.error(val);
            du.debug(err);
            return val;
        });
    }

    deleteAll(env) {
        let tables = this.getTableNames(env);

        return Promise.map(tables, (table) => {
            return this.deleteTable(env+table);
        }, {concurrency: 7})
        .then((vals) => {
            du.debug(vals);
            return vals;
        })
        .catch((err) => {
            du.error(err);
        })
    }

    getMigrationFileNames(){

	      du.debug('Get DynamoDB Migration FileNames');

	      let migration_directory = this.getConfigDir();
	      let files = fs.readdirSync(migration_directory);

	      return files.map(file => {
		        return file.replace('.json','');
	      });
    }

    getTableNames(){

	      du.debug('Get DynamoDB Table Names');

	      let migration_directory = this.getConfigDir();
	      let files = fs.readdirSync(migration_directory);

	      return files.map(file => {
		        return this.getTableName(file);
	      });
    }

    getTableName(tableFileName) {
        let obj = require(this.getConfigDir() + '/' + tableFileName);
        let name = (obj.Table || {}).TableName || '';

        if (!name) {
            eu.throwError('server','Unable to identify table name in DynamoDB migration JSON.');
        }
        return name
    }

    getConfig() {
	      let config = require(__dirname+'/../../serverless.yml') || false;

        if (!config) {
            throw 'Unable to find config file';
        }
        return config;
    }

    getConfigDir() {
        let config = this.getConfig();
        let migration = ((config.custom || {}).dynamodb || {}).migration || {};
        let path = migration.dir || '';

        if (!path) {
            throw 'custom.dynamodb.migration.dir not set in serverless yml';
        }
	      return  __dirname+'/../../'+path;
    }

    //random time between 2-7 seconds
    getWaitTime() {
        return (Math.random() * 100 % 5 + 2) * 1000;
    }

    waitForCreation(tableName) {
        return new Promise((resolve, reject) => {
            this.repeatWhileStatus(tableName, 'CREATING', resolve, reject);
        });
    }

    waitForDeletion(tableName) {
        return new Promise((resolve, reject) => {
            this.repeatWhileStatus(tableName, 'DELETING', resolve, reject);
        });
    }

    repeatWhileStatus(tableName, status, res, rej) {
        dynamodbutilities.describeTable(tableName, (err, data) => {
            if (err) {
                if (err.code === 'ResourceNotFoundException') {
                    if (status === 'DELETING') {
                        return res(true);
                    } else {
                        du.debug(`Waiting for ${tableName} to be found`);
                        setTimeout( ()=>{
                            this.repeatWhileStatus(tableName, status, res, rej)
                        }, this.getWaitTime());
                    }
                }
                return rej(err);
            }
            if (data.Table.TableStatus === status) {
                du.debug(`Waiting for ${status} status to change on table: ${tableName}`);
                setTimeout( ()=>{
                    this.repeatWhileStatus(tableName, status, res, rej)
                }, this.getWaitTime());
            } else {
                return res(data.Table.TableStatus);
            }
        });
    }

}

module.exports = new DynamoDeployTables();
