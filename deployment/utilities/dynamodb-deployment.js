'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class DynamoDBDeployment extends AWSDeploymentUtilities {

    constructor(){

      super();

      this.dynamodbutilities = global.SixCRM.routes.include('lib', 'dynamodb-utilities.js');

      this.controllers = [];

    }

    deployTable(table_definition_filename) {

      let table_definition = global.SixCRM.routes.include('tabledefinitions', table_definition_filename);

      return this.tableExists(table_definition.Table.TableName).then((result) => {

        if(result == false){

          return this.dynamodbutilities.createTable(table_definition.Table).then((result) => {

            return this.dynamodbutilities.waitFor(table_definition.Table.TableName, 'tableExists');

          });

        }else{

          //Technical Debt:  Complete this!
          //return this.dynamodbutilities.updateTable(table_definition.Table);
          return true
        }

      });

    }

    tableExists(table_name){

      du.debug('Table Exists');

      return this.dynamodbutilities.describeTable(table_name).then((results) => {

        if(_.isNull(results)){
          du.highlight('Table not found: '+table_name);
          return false;
        }
        du.highlight('Table found: '+table_name);
        return results;

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

    purgeTable(table_definition_filename){

      du.debug('Purge Table');

      let table_definition = global.SixCRM.routes.include('tabledefinitions', table_definition_filename);

      return this.tableExists(table_definition.Table.TableName).then((result) => {

        if(objectutilities.isObject(result)){

          //du.highlight(table_definition.Table.TableName+' table exists, purging');

          du.warning('Complete this feature...');

        }else{

          //du.highlight(table_definition.Table.TableName+' table doesn\'t exist, skipping');

        }

        return true;

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

    seedTables() {

      du.debug('Seed Tables');

      permissionutilities.disableACLs();

      return this.initializeControllers().then(() => {

        return this.getTableSeedFilenames().then((table_seed_definition_filenames) => {

          let table_seed_promises = arrayutilities.map(table_seed_definition_filenames, (table_seed_definition_filename) => {
            return () => this.seedTable(table_seed_definition_filename);
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

      return table_seed_definition_filename.replace(/\.json/,'');


    }

    executeSeedViaController(table_description, seed_definitions){

      du.debug('Execute Seed Via Controller');

      let entity_name = this.getEntityName(table_description.Table.TableName);

      let controller = this.getController(entity_name);

      let seed_promises = arrayutilities.map(seed_definitions, (seed_definition) => {

        return controller.store(seed_definition).then((result) => {
          return true;
        }).catch(error => {
          du.error('Error while seeding '+controller.descriptive_name+' with seed id '+seed_definition.id+': '+error.message);
        });

      });

      return Promise.all(seed_promises);

    }

    getEntityName(table_name){

      du.debug('Get Entity Name');

      return table_name.replace(/s$/, '');

    }

    initializeControllers(){

      du.debug('Initialize Controllers');

      return this.getControllerFilenames().then((filenames) => {

        filenames.forEach((filename) => {

          this.controllers.push(global.SixCRM.routes.include('entities', filename));

        });

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

          return this.dynamodbutilities.deleteTable(table_definition.Table.TableName).then((result) => {

            return this.dynamodbutilities.waitFor(table_definition.Table.TableName, 'tableNotExists');

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

    getTableSeedFilenames(){

      du.debug('Get Table Seed Filenames');

      let directory_path = global.SixCRM.routes.path('seeds');

      return fileutilities.getDirectoryFiles(directory_path);

    }

    getControllerFilenames(){

      du.debug('Get Table Seed Filenames');

      let directory_path = global.SixCRM.routes.path('controllers', 'entities');

      return fileutilities.getDirectoryFiles(directory_path);

    }

}

module.exports = new DynamoDBDeployment();
