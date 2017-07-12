"use strict"
require('../../routes.js');

const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const sqsutilities = global.routes.include('lib', 'sqs-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

let environment = process.argv[2];
let environment_account_id = process.argv[3];
let region = process.argv[4];

let serverless_config = configurationutilities.getServerlessConfig();

du.highlight('Executing SQS Purge');

let purge_promises = [];

du.debug('Serverless Config: ', serverless_config);

// Technical Debt: Deprecated.
for(const resource in serverless_config.resources.Resources) {

    let resource_definition = serverless_config.resources.Resources[resource];

    if(_.has(resource_definition, 'Type') && resource_definition.Type == 'AWS::SQS::Queue'){

        if(_.has(resource_definition, 'Properties') && _.has(resource_definition.Properties, 'QueueName')){

            let queue_name = buildQueueName(resource_definition.Properties.QueueName);

            du.highlight('Purging Queue: '+queue_name);

            purge_promises.push(purgeQueue(queue_name));

        }

    }

}

Promise.all(purge_promises).then((purge_results) => {

    du.highlight('Queues Purged');
	//du.debug(purge_results);

}).catch((error) => {

    du.warning(error);

});

function purgeQueue(queue_shortname){

    du.debug('Purge Queue');

    return new Promise((resolve, reject) => {

        sqsutilities.purgeQueue({queue: queue_shortname}, (error, data) => {

            if(error){

                return reject(error);

            }else{

                return resolve(data);

            }

        });

    });

}

function buildQueueName(proto_queue_name){

    du.debug('Build Queue Name');

    return proto_queue_name.replace('${opt:stage}', environment);

}
