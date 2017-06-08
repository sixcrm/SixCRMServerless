'use strict';
require('require-yaml');
const fs = require('fs');
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const PermissionUtilities = global.routes.include('lib', 'permission-utilities.js');

class DynamoDeploySeeds {
    constructor(){
        // Technical Debt: Rename these tables and/or controllers to be consistent across codebase.

        this.blacklisted_seeds = ['ses_notifications'];
        this.differently_named_seeds = {
            emailtemplates: 'EmailTemplate',
            fullfillment_providers: 'FulfillmentProvider',
            loadbalancers: 'LoadBalancer',
            smtp_providers: 'SMTPProvider',
            user_acls: 'UserACL'
        };
    }

    deploySeed(seed) {
        let entity = this.getEntityName(seed);

        let controller = global.routes.include('controllers', 'entities/' + entity);
        let seed_content = global.routes.include('seeds', seed + '.json').Seeds;

        du.highlight(`Seeding ${entity}`);

        seed_content.forEach((entity) => {
            controller.store(entity).catch(error => {
                du.error(`Error while seeding '${controller.descriptive_name}' with id '${entity.id}': ${error.message}`);
            });
        });


        return Promise.resolve(`Finished seeding '${entity}'.`);
    }

    // Technical Debt: This has troubles connecting to local DynamoDB instance.
    deployAllSeeds(environment) {
        PermissionUtilities.disableACLs();
        process.env.stage = environment;
        process.env.search_indexing_queue_url = this.getConfig().sqs.search_indexing_queue_url;
        process.env.dynamo_endpoint = this.getConfig().dynamodb.endpoint;

        du.highlight(`Deploying seeds on ${environment} environment.`);

        let seeds = this.getSeedFileNames().filter((seed) => !_.contains(this.blacklisted_seeds, seed));

        seeds.forEach((seed) => {
            this.deploySeed(seed).then((output) => {
                du.debug(output);
            });
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


    getEntityName(seed) {
        if (this.differently_named_seeds[seed]) {
            return this.differently_named_seeds[seed];
        }

        let name = seed;

        name = name.replace(/s$/,''); // remove trailing 's'
        name = name[0].toUpperCase() + name.slice(1); // capitalize

        while (name.match(/_/)) {
            let underscore = name.indexOf('_');

            name = name.slice(0, underscore) + name[underscore + 1].toUpperCase() + name.slice(underscore + 2);
        }

        return name;
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
