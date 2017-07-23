"use strict"
require('../../SixCRM.js');
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

du.highlight('Executing SQS Purge');

let purge_promises = [];

let serverless_config = global.SixCRM.configuration.serverless_config;

// Technical Debt: Deprecated.

for(const resource in serverless_config.resources.Resources) {

    let resource_definition = serverless_config.resources.Resources[resource];

    if(_.has(resource_definition, 'Type') && resource_definition.Type == 'AWS::SQS::Queue'){

        if(_.has(resource_definition, 'Properties') && _.has(resource_definition.Properties, 'QueueName')){

            let queue_name = resource_definition.Properties.QueueName;

            du.highlight('Purging Queue: '+queue_name);

            purge_promises.push(purgeQueue(queue_name));

        }

    }

}

Promise.all(purge_promises).then(() => {

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
