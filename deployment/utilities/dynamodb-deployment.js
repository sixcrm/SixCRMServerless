
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');

module.exports = class DynamoDBDeployment extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.dynamodbprovider = new DynamoDBProvider();
		this.iamprovider = new IAMProvider();

		this.controllers = [];

	}

	deployTable(table_definition_filename) {

		let table_definition = global.SixCRM.routes.include('tabledefinitions', table_definition_filename);

		return this.tableExists(table_definition.Table.TableName).then((result) => {

			if(result == false){

				return this.dynamodbprovider.createTable(table_definition.Table).then(() => {

					return this.dynamodbprovider.waitFor(table_definition.Table.TableName, 'tableExists').then(() => {

						return du.info('Successfully created table: '+table_definition.Table.TableName);

					});

				});

			}else{

				//Technical Debt:  Complete this!
				//return this.dynamodbprovider.updateTable(table_definition.Table);
				return true
			}

		});

	}

	tableExists(table_name){

		du.debug('Table Exists');

		return this.dynamodbprovider.describeTable(table_name, false).then((results) => {

			du.info('Table found: '+table_name);
			return results;

		}).catch(() => {

			du.info('Unable to find table '+table_name);
			return false;

		});

	}

	purgeTables() {

		du.debug('Purge Tables');

		return this.getTableDefinitionFilenames().then((table_definition_filenames) => {

			let table_deployment_promises = arrayutilities.map(table_definition_filenames, (table_definition_filename) => {
				return () => this.purgeTable(table_definition_filename);
			});

			return arrayutilities.serial(
				table_deployment_promises
			).then(() => {
				return 'Complete';
			});

		});

	}

	getAllTableKeys(table_name){

		du.debug('Get All Table Keys');

		du.warning(table_name);

		return this.dynamodbprovider.scanRecords(table_name).then(results => {
			let return_array = [];

			if(_.has(results, 'Items')){
				arrayutilities.map(results.Items, item => {
					if(_.has(item, 'id')){
						return_array.push(item.id);
					}
				});
			}
			return arrayutilities.unique(return_array);
		});

	}

	purgeTable(table_definition_filename){

		du.debug('Purge Table');

		let table_definition = global.SixCRM.routes.include('tabledefinitions', table_definition_filename);

		return this.tableExists(table_definition.Table.TableName).then((result) => {

			if(objectutilities.isObject(result)){

				du.info(table_definition.Table.TableName+' table exists, purging');

				return this.getAllTableKeys(table_definition.Table.TableName).then(table_keys => {

					if(table_keys.length > 100){

						//destroy
						//rebuild
						return true;

					}

					if(arrayutilities.nonEmpty(table_keys)){

						let seeds = global.SixCRM.routes.include('seeds', table_definition.Table.TableName);
						let delete_count = 0;

						let delete_promises = arrayutilities.map(table_keys, (table_key) => {

							if (seeds.find((seed) => seed.id === table_key)) {
								du.info('Deleting ' + table_definition.Table.TableName + ' with id ' + table_key);

								this.dynamodbprovider.deleteRecord(table_definition.Table.TableName, {id: table_key}, null, null);
								delete_count++;

								return;
							} else {
								du.info('Not deleting ' + table_definition.Table.TableName + ' with id ' + table_key);
							}

						});

						return Promise.all(delete_promises).then(() => {

							du.info(delete_count+' records deleted.');

							return true;

						});

					}else{

						du.info('Table is empty.');

						return true;

					}

				});

			}else{

				du.info(table_definition.Table.TableName+' table doesn\'t exist.');

				return true;

			}

		});

	}

	deployTables() {

		du.debug('Deploy Tables');

		return this.getTableDefinitionFilenames().then((table_definition_filenames) => {

			let table_deployment_promises = arrayutilities.map(table_definition_filenames, (table_definition_filename) => {
				return () => this.deployTable(table_definition_filename);
			});

			return arrayutilities.serial(
				table_deployment_promises
			).then(() => {
				return 'Complete';
			});

		});

	}

	destroyTables(){

		return this.getTableDefinitionFilenames().then((table_definition_filenames) => {

			let table_destroy_promises = arrayutilities.map(table_definition_filenames, (table_definition_filename) => {
				return () => this.destroyTable(table_definition_filename);
			});

			return arrayutilities.serial(
				table_destroy_promises
			).then(() => {
				return 'Complete';
			});

		});

	}

	backupTables({branch, version}){

		return this.getTableDefinitionFilenames().then((table_definition_filenames) => {

			let table_backup_promises = arrayutilities.map(table_definition_filenames, (table_definition_filename) => {
				return this.backupTable({table_definition_filename: table_definition_filename, branch: branch, version: version});
			});

			return Promise.all(
				table_backup_promises
			).then(() => {
				return 'Complete';
			});

		});

	}

	backupTable({table_definition_filename, branch, version}) {

		let table_definition = global.SixCRM.routes.include('tabledefinitions', table_definition_filename);

		return this.tableExists(table_definition.Table.TableName).then((result) => {

			if(objectutilities.isObject(result)){

				let parameters = {
					TableName: table_definition.Table.TableName,
					BackupName: table_definition.Table.TableName+'-'+stringutilities.replaceAll(timestamp.getISO8601(),':','.')
				};

				if(!_.isNull(branch) && !_.isUndefined(branch) && !_.isNull(version) && !_.isUndefined(version)){
					parameters.BackupName = table_definition.Table.TableName+'-'+branch+'-'+version;
				}

				return this.dynamodbprovider.createBackup(parameters).then((result) => {

					if(objectutilities.hasRecursive(result, 'BackupDetails.BackupStatus')){
						du.info(table_definition.Table.TableName+' backup triggered: ('+result.BackupDetails.BackupName+')');
						return true;
					}

					du.warning('Unable to trigger backup.');
					du.info(result);

					return false;

				});

			}

			return true;

		});

	}

	seedTables(live = false) {

		du.debug('Seed Tables');

		permissionutilities.disableACLs();
		permissionutilities.setPermissions('*',['*/*'],[]);

		return this.initializeControllers().then(() => {

			return this.getTableSeedFilenames(live).then((table_seed_definition_filenames) => {

				let table_seed_promises = arrayutilities.map(table_seed_definition_filenames, (table_seed_definition_filename) => {
					return () => this.seedTable(table_seed_definition_filename, live);
				});

				return arrayutilities.serial(
					table_seed_promises
				).then(() => {
					return 'Complete';
				});

			});

		});

	}

	seedTable(table_seed_definition_filename){

		du.debug('Seed Table');

		let seed_definitions = global.SixCRM.routes.include('seeds', table_seed_definition_filename);

		let table_name = this.getTableNameFromFilename(table_seed_definition_filename);

		return this.tableExists(table_name).then((result) => {

			if(objectutilities.isObject(result)){

				return this.executeSeedViaController(result, seed_definitions);

			}

			return true;

		});

	}

	getTableNameFromFilename(table_seed_definition_filename){

		du.debug('Get Table Name From Filename');

		let filename_array = table_seed_definition_filename.split('/');

		return filename_array.pop().replace(/\.json/,'');

	}

	executeSeedViaController(table_description, seed_definitions){

		du.debug('Execute Seed Via Controller');

		let entity_name = this.getEntityName(table_description.Table.TableName);

		let controller = this.getController(entity_name);

		let seed_promises = arrayutilities.map(seed_definitions, (seed_definition) => {

			return controller.store({entity: seed_definition, ignore_updated_at: true}).then(() => {
				return true;
			}).catch(error => {
				du.warning(error);
				du.error('Error while seeding '+controller.descriptive_name+' with seed id '+seed_definition.id+': '+error.message);
			});

		});

		return Promise.all(seed_promises);

	}

	getEntityName(table_name){

		du.debug('Get Entity Name');

		if(table_name.match(/^.*ies$/)){

			return table_name.replace(/ies$/, 'y');

		}

		return table_name.replace(/s$/, '');

	}

	initializeControllers(){

		du.debug('Initialize Controllers');

		if (this.controllers.length > 0) {
			return Promise.resolve();
		}

		return this.getControllerFilenames().then((filenames) => {

			filenames.filter(filename => filename !== 'Entity.js').forEach((filename) => {

				let controller = global.SixCRM.routes.include('entities', filename);

				if (_.isFunction(controller)) {
					this.controllers.push(new controller());
				} else {
					this.controllers.push(controller);
				}

			});

			return true;

		});

	}

	getController(entity_name){

		du.debug('Get Controller');

		let matched_controllers =  this.controllers
			.filter(controller => controller.descriptive_name)
			.filter(controller => controller.descriptive_name === entity_name);

		if (matched_controllers.length < 1) {
			du.error('No entity controller found for entity "'+entity_name+'"');
			return null;
		}

		if (matched_controllers.length > 1) {
			du.error('More than one controller found for entity "'+entity_name+'"');
			return null;
		}

		return matched_controllers[0];

	}

	destroyTable(table_definition_filename) {

		let table_definition = global.SixCRM.routes.include('tabledefinitions', table_definition_filename);

		return this.tableExists(table_definition.Table.TableName).then((result) => {

			if(objectutilities.isObject(result)){

				return this.dynamodbprovider.deleteTable(table_definition.Table.TableName).then(() => {

					return this.dynamodbprovider.waitFor(table_definition.Table.TableName, 'tableNotExists');

				});

			}

			return true;

		});

	}

	getTableDefinitionFilenames(){

		du.debug('Get Table Definition Filenames');

		let directory_path = global.SixCRM.routes.path('tabledefinitions');

		return fileutilities.getDirectoryFiles(directory_path);

	}

	async getTableSeedFilenames(live = false){

		du.debug('Get Table Seed Filenames');

		let directory_path = null;

		if(live == true){

			let environment = global.SixCRM.configuration.stage;

			if(stringutilities.nonEmpty(environment)){

				directory_path = global.SixCRM.routes.path('seeds', environment);

				let files = await fileutilities.getDirectoryFiles(directory_path)

				return arrayutilities.map(files, file => {
					return environment+'/'+file;
				});

			}

			return [];

		}else{

			directory_path = global.SixCRM.routes.path('seeds');

			return fileutilities.getDirectoryFiles(directory_path)

		}

		//throw eu.throwError('server', 'Unexpected seed directory.');

	}

	getControllerFilenames(){

		du.debug('Get Table Seed Filenames');

		let directory_path = global.SixCRM.routes.path('controllers', 'entities');

		return fileutilities.getDirectoryFiles(directory_path);

	}

}
