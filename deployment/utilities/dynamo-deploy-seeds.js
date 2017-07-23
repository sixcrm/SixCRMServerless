'use strict';
const fs = require('fs');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

class DynamoDeploySeeds {
    constructor(){
        this.controllers = [];
    }

    deploySeed(seed_type) {

        let entity_name = this.getEntityName(seed_type);
        let controller = this.getController(entity_name);
        let seeds = global.SixCRM.routes.include('seeds', seed_type + '.json');

        du.highlight('Seeding '+seed_type);

        seeds.forEach((seed) => {

            controller.store(seed).then((result) => {
                du.deep(result);
            }).catch(error => {
                du.error('Error while seeding '+controller.descriptive_name+' with seed id '+seed.id+': '+error.message);
            });

        });

        return Promise.resolve('Finished seeding '+seed_type+'.');

    }

    setEnvironment(){

      process.env.search_indexing_queue = global.SixCRM.configuration.serverless_config.provider.environment.search_indexing_queue;
      process.env.dynamo_endpoint = global.SixCRM.configuration.site_config.dynamodb.endpoint;
      process.env.redshift_user = global.SixCRM.configuration.site_config.redshift.user;
      process.env.redshift_password = global.SixCRM.configuration.site_config.redshift.password;
      process.env.redshift_host = global.SixCRM.configuration.site_config.redshift.host;
      process.env.redshift_database = global.SixCRM.configuration.site_config.redshift.database;
      process.env.redshift_port = global.SixCRM.configuration.site_config.redshift.port;
      process.env.redshift_pool_max = global.SixCRM.configuration.site_config.redshift.user;
      process.env.redshift_idle_timeout = global.SixCRM.configuration.site_config.redshift.idleTimeoutMillis;
      process.env.aws_region = global.SixCRM.configuration.site_config.aws.region;
      process.env.aws_account = global.SixCRM.configuration.site_config.aws.account;

    }

    deployAllSeeds() {

        permissionutilities.disableACLs();

        this.setEnvironment();

        this.initializeControllers();

        let seeds = this.getSeedFileNames();

        seeds.forEach((seed) => {
            this.deploySeed(seed).then((output) => {
                du.debug(output);
            });
        });

    }

    initializeControllers() {

        let controller_directory = global.SixCRM.routes.path('controllers', 'entities');

        let files = fs.readdirSync(controller_directory);

        files.forEach((file) => {
          this.controllers.push(global.SixCRM.routes.include('entities', file));
        });

    }

    getSeedFileNames(){

        du.debug('Get DynamoDB Seed FileNames');

        let seed_directory = global.SixCRM.routes.path('seeds');
        let files = fs.readdirSync(seed_directory);

        return files.map(file => {
            return file.replace('.json','');
        });

    }

    getController(controller_name) {

        du.debug('Get controller for entity ' + controller_name);

        let matched_controllers =  this.controllers
            .filter(controller => controller.descriptive_name)
            .filter(controller => controller.descriptive_name === controller_name);

        if (matched_controllers.length < 1) {
            du.error('No entity controller found for entity "'+controller_name+'"');
            return null;
        }

        if (matched_controllers.length > 1) {
            du.error('More than one controller found for entity "'+controller_name+'"');
            return null;
        }

        return matched_controllers[0];
    }

    getEntityName(seed){

        return seed.replace(/s$/, '');

    }

}

module.exports = new DynamoDeploySeeds();
