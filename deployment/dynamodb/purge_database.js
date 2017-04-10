"use strict"
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('underscore');
const du = require('../../lib/debug-utilities.js');
const dynamodbutilities = require('../../lib/dynamodb-utilities.js');

du.highlight('Purging DynamoDB Tables');

let environment = process.argv[2];

let table_names = getDynamoDBTableNames().then((table_names) => {
	
	if(table_names.length > 0){
		
		//Technical Debt:  these need to happen in batches of 10	
		let promises = [];
	
		table_names.forEach((table_name) => {
			
			du.debug(table_name);
			
			promises.push(purgeTable(table_name));
			
		});
		
		if(promises.length > 0){
			
			Promise.all(promises.map(p => p.catch(e => e)))
			.then((results) => {
				du.debug(results);
				du.highlight('Tables purged.');
			}).catch((error) => {
				du.warning(error);
			});
			
		}else{
			
			du.highlight('Something strange happened.');
			
		}
		
	}else{
		
		du.highlight('No tables to purge.');
		
	}
	
}).catch((error) => {

	throw new Error(error);
	
});

function purgeTable(table_name){
	
	return new Promise((resolve, reject) => {
		
		dynamodbutilities.deleteTable(table_name, (error, data) => {
			
			if(error){
			
				return reject(error);
				
			}
			
			return resolve(data);
			
		});
	
	});

}

function getDynamoDBTableDirectory(){ 
	
	du.debug('Get DynamoDB Table Directory');
	
	var serverless_config = yaml.safeLoad(fs.readFileSync(__dirname+'/../../serverless.yml', 'utf8'));
	
	if(_.has(serverless_config, 'custom') && _.has(serverless_config.custom, 'dynamodb') && _.has(serverless_config.custom.dynamodb, 'migration') && _.has(serverless_config.custom.dynamodb.migration, 'dir')){
		
		let migration_directory = __dirname+'/../../'+serverless_config.custom.dynamodb.migration.dir;
		
		return migration_directory;
			
	}
	
}

function getDynamoDBTableNames(){
	
	du.debug('Get DynamoDB Table Names');
	
	return new Promise((resolve) => {
	
		let table_names = [];
	
		let migration_directory = getDynamoDBTableDirectory();
	
		fs.readdir(migration_directory, (err, files) => {

			files.forEach(file => {

				let obj = JSON.parse(fs.readFileSync(migration_directory+'/'+file, 'utf8'));
				let proto_table_name = parseTableName(obj);
				let stage_table_name = buildFullyQualifiedTableName(proto_table_name);

				table_names.push(stage_table_name);

			});

			return resolve(table_names);
			
		});
	
	});
	
}

function parseTableName(json_object){
	
	du.debug('Parse Table Name');
	
	if(_.has(json_object, 'Table') && _.has(json_object.Table, 'TableName')){
		
		return json_object.Table.TableName;
		
	}
	
	throw new Error('Unable to identify table name in DynamoDB migration JSON.');
	
}

function buildFullyQualifiedTableName(proto_table_name){
	
	du.debug('Build Fully Qualified Table Name');
	
	return environment+proto_table_name;

}