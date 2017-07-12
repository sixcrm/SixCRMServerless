'use strict';
require('../../routes.js');
const _ = require('underscore');
const fs = require('fs');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

const sqsUtils = global.routes.include('lib', 'sqs-utilities.js');

// Techincal Debt:  KISS or die
let delay = (time) => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));

//const maxReceiveCount = 5;
const stage = process.argv[2];

return setEnvironment(stage)
.then(() => getQueueDefinitions())
.then(queueDefinitions => deleteQueues(queueDefinitions))
//Technical Debt:  we should just check the status of the operations with AWS CLI
.then((queueDefinitions) => {
    du.highlight('Pausing for deletes...');
    return queueDefinitions;
})
.then(delay(70000))
.then(() => {
  du.highlight('Queue Deletion Complete')
})
.catch((error) => {
    du.error(error);
    eu.throwError('server', error);
});

function deleteQueues(queue_definitions) {

    let delete_promises = [];

    queue_definitions.map((queue_definition) => {
      delete_promises.push(sqsUtils.deleteQueue(queue_definition.QueueName));
      delete_promises.push(sqsUtils.deleteQueue(createDeadletterQueueName(queue_definition)));
    });

    return Promise.all(delete_promises).then(() => {
        return queue_definitions;
    });

}

function setEnvironment(stage){

  let config = getConfig(stage);

  if(_.has(config, 'aws') && _.has(config.aws, 'region')){

    process.env.aws_region = config.aws.region;

  }else{

    if(_.has(process.env, 'AWS_REGION')){
      process.env.aws_region = process.env.AWS_REGION;
    }

  }

  if(_.has(config, 'aws') && _.has(config.aws, 'account')){

    process.env.aws_account = config.aws.account;

  }else{

    if(_.has(process.env, 'AWS_ACCOUNT')){
      process.env.aws_account = process.env.AWS_ACCOUNT;
    }

  }

  return Promise.resolve(true);

}

function getQueueDefinitions(){

  const files = fs.readdirSync(global.routes.path('deployment', 'sqs/queues'));

  const queue_objects = files.map((file) => {

    du.debug('Queue Definition File: '+file);

    return global.routes.include('deployment', 'sqs/queues/'+file);

  });

  return Promise.resolve(queue_objects);

}

/*
function createDeadletterQueueDefinition(queue) {

    //Note: the JSON method are necessary for parsing
    let dlq_definition = JSON.parse(JSON.stringify(queue));

    dlq_definition.QueueName = createDeadletterQueueName(dlq_definition);

    return dlq_definition;

}
*/

function createDeadletterQueueName(queue){

  let queue_name = null;

  if(_.isObject(queue)){

    if(_.has(queue, 'QueueName')){

      queue_name = queue.QueueName;

    }

  }

  if(_.isString(queue)){
    queue_name = queue;
  }


  if(!_.isString(queue_name)){

    eu.throwError('server', 'Unable to indentify queue name.');

  }

  let new_queue_name = queue_name + sqsUtils.deadletter_postfix;

  return new_queue_name;

}

function getConfig(stage) {

  if(_.isUndefined(stage)){
    if(_.has(process.env, 'stage')){
      stage = process.env.stage;
    }else{
      eu.throwError('server', 'stage environment variable is not set.');
    }
  }

  let config = global.routes.include('config', stage+'/site.yml');

  if (!config) {
      throw 'Unable to find config file.';
  }

  return config;

}
