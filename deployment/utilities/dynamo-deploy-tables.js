'use strict'
require('require-yaml');
//Technical Debt:  This use of bluebird should be eliminated
const Promise = require('bluebird');
const fs = require('fs');
const exec = require('child-process-promise').exec;
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const dynamodbutilities = global.routes.include('lib', 'dynamodb-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const parserutilities = global.routes.include('lib', 'parser-utilities.js');

class DynamoDeployTables {

    constructor(){

      this.migration_directory = global.routes.path('tabledefinitions');

      this.deploy_table_command = 'serverless dynamodb execute -s {{stage}} -n {{table_name}}  -r {{region}}';

      this.retry_count = 25;

    }

    buildDeploymentCommand(table_name){

      let parameters = {
        region:this.region,
        stage:this.stage,
        table_name: table_name
      };

      return parserutilities.parse(this.deploy_table_command, parameters);

    }

    deployTable(table_definition_filename, counter) {

        let execution_count = counter || 0;

        let table_name = this.getTableName(table_definition_filename);
        let parsed_command = this.buildDeploymentCommand(table_name);

        return exec(parsed_command)
        .then(() => {
            return table_name;
        })
        .then(this.waitForCreation.bind(this))
        .then(() => {

            let message = 'Successfully created table: '+table_name;

            du.highlight(message);
            return message;

        })
        .catch((error) => {

            if (execution_count++ < this.retry_count) {

                return this.deployTable(table_definition_filename, execution_count)

            } else {

                let message = 'Failed to create table: '+table_name;

                du.error(message);
                du.debug(error);

                return message;

            }

        });

    }

    setStage(stage){

      this.stage = configurationutilities.resolveStage(stage);

    }

    setRegion(region){

      if(_.isUndefined(region)){

        let configuration = configurationutilities.getSiteConfig(this.stage);

        if(_.has(configuration, 'aws') && _.has(configuration.aws, 'region')){

          region = configuration.aws.region;

        }

      }

      this.region = region;

    }

    deployAll(stage) {

      this.setStage(stage);

      this.setRegion();

      let tables = this.getMigrationFileNames();

      return Promise.map(tables, (table) => {
          return this.deployTable(table, this.stage, this.region);
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

    deleteAll() {

        let tables = this.getTableNames();

        return Promise.map(tables, (table) => {
            return this.deleteTable(table);
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

      let files = fs.readdirSync(this.migration_directory);

      return files.map(file => {
	        return file.replace('.json','');
      });

    }

    getTableNames(){

      du.debug('Get DynamoDB Table Names');

      let files = fs.readdirSync(this.migration_directory);

      return files.map(file => {
	        return this.getTableName(file);
      });

    }

    getTableName(table_definition_filename) {

        let obj = global.routes.include('tabledefinitions', table_definition_filename);

        let name = (obj.Table || {}).TableName || '';

        if (!name) {
            eu.throwError('server','Unable to identify table name in DynamoDB migration JSON.');
        }

        return name;

    }

    //random time between 2-7 seconds
    getWaitTime() {

      //Technical Debt:  Use Timestamp
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
