'use strict';
const fs = require('fs');
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const permissionutilities = global.routes.include('lib', 'permission-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

class DynamoDeploySeeds {
    constructor(){
        this.controllers = [];
    }

    deploySeed(seed_type) {

        let entity_name = this.getEntityName(seed_type);
        let controller = this.getController(entity_name);
        let seeds = global.routes.include('seeds', seed_type + '.json');

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

    setEnvironment(stage){

      stage = configurationutilities.resolveStage(stage)

      this.stage_configuration = configurationutilities.getSiteConfig(stage);
      this.serverless_configuration = configurationutilities.getServerlessConfig();

      process.env.stage = stage;
      process.env.search_indexing_queue = this.serverless_configuration.provider.environment.search_indexing_queue;
      process.env.dynamo_endpoint = this.stage_configuration.dynamodb.endpoint;
      process.env.redshift_user = this.stage_configuration.redshift.user;
      process.env.redshift_password = this.stage_configuration.redshift.password;
      process.env.redshift_host = this.stage_configuration.redshift.host;
      process.env.redshift_database = this.stage_configuration.redshift.database;
      process.env.redshift_port = this.stage_configuration.redshift.port;
      process.env.redshift_pool_max = this.stage_configuration.redshift.user;
      process.env.redshift_idle_timeout = this.stage_configuration.redshift.idleTimeoutMillis;
      process.env.aws_region = this.stage_configuration.aws.region;
      process.env.aws_account = this.stage_configuration.aws.account;

    }

    deployAllSeeds(stage) {

        permissionutilities.disableACLs();

        this.setEnvironment(stage);

        this.initializeControllers();

        du.highlight('Deploying seeds on '+process.env.stage+' environment.');

        let seeds = this.getSeedFileNames();

        seeds.forEach((seed) => {
            this.deploySeed(seed).then((output) => {
                du.debug(output);
            });
        });

    }

    initializeControllers() {

        let controller_directory = global.routes.path('controllers', 'entities');

        let files = fs.readdirSync(controller_directory);

        files.forEach((file) => {
          this.controllers.push(global.routes.include('entities', file));
        });

    }

    getSeedFileNames(){

        du.debug('Get DynamoDB Seed FileNames');

        let seed_directory = global.routes.path('seeds');
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
