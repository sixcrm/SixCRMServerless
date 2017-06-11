'use strict';
require('require-yaml');
const fs = require('fs');
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const PermissionUtilities = global.routes.include('lib', 'permission-utilities.js');

class DynamoDeploySeeds {
    constructor(){
        this.controllers = [];
    }

    deploySeed(seed) {
        let entity_name = this.getEntityName(seed);
        let controller = this.getController(entity_name);
        let seed_content = global.routes.include('seeds', seed + '.json');

        du.highlight(`Seeding ${seed}`);

        seed_content.forEach((entity) => {

            controller.store(entity).then((result) => {
                du.deep(result);
            }).catch(error => {
                du.error(`Error while seeding '${controller.descriptive_name}' with id '${entity.id}': ${error.message}`);
            });

        });

        return Promise.resolve(`Finished seeding '${seed}'.`);

    }

    // Technical Debt: This has troubles connecting to local DynamoDB instance.
    deployAllSeeds(environment) {
        PermissionUtilities.disableACLs();
        process.env.stage = environment;
        process.env.search_indexing_queue_url = this.getConfig().sqs.search_indexing_queue_url;
        process.env.dynamo_endpoint = this.getConfig().dynamodb.endpoint;

        this.initializeControllers();

        du.highlight(`Deploying seeds on ${environment} environment.`);

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

        files.forEach((file) => { this.controllers.push(global.routes.include('controllers', `entities/${file}`)) });
    }

    getSeedFileNames(){

        du.debug('Get DynamoDB Seed FileNames');

        let seed_directory = global.routes.path('seeds');
        let files = fs.readdirSync(seed_directory);

        return files.map(file => {
            return file.replace('.json','');
        });
    }

    getController(name) {
        du.debug('Get controller for entity ' + name);

        let matched_controllers =  this.controllers
            .filter(controller => controller.descriptive_name)
            .filter(controller => controller.descriptive_name === name);

        if (matched_controllers.length < 1) {
            du.error(`No entity controller found for entity '${name}'.`);
            return null;
        }

        if (matched_controllers.length > 1) {
            du.error(`More than one controller found for entity '${name}'.`);
            return null;
        }

        return matched_controllers[0];
    }

    getEntityName(seed) {
        return seed.replace(/s$/, '');
    }

    getConfig() {
        let config = global.routes.include('config', `${process.env.stage}/site.yml`);

        if (!config) {
            throw 'Unable to find config file.';
        }
        return config;
    }
}

module.exports = new DynamoDeploySeeds();
