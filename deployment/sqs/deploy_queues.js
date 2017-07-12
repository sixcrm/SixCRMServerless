'use strict';
require('../../routes.js');
const _ = require('underscore');
const fs = require('fs');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const sqsutilities = global.routes.include('lib', 'sqs-utilities.js');

const max_receive_count = 5;

const stage = process.argv[2];

du.highlight(`Executing SQS Deployment`);

return setEnvironment(stage)
.then(() => getQueueDefinitions())
.then((queue_definitions) => createDeadletterQueues(queue_definitions))
.then((queue_definitions) => createQueues(queue_definitions))
.then(() => {
  du.highlight('Queue Creation Complete')
})
.catch((error) => {
    du.error(error);
    eu.throwError('server', error);
});

function setEnvironment(stage){

  let config = configurationutilities.getSiteConfig(stage);

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

function createDeadletterQueues(queue_definitions) {

    let create_promises = [];

    //Note:  From existing queue definitions, create deadletter queue definitions
    queue_definitions.forEach((queue_definition) => {

      let deadletter_queue_definition = createDeadletterQueueDefinition(queue_definition);

      create_promises.push(sqsutilities.createQueue(deadletter_queue_definition));

    });

    return Promise.all(create_promises).then(create_promises => {

      du.deep('Create results:', create_promises);

      du.info(queue_definitions);

      return queue_definitions;

    });
}

function createQueues(queue_definitions) {

    let create_promises = [];

    queue_definitions.map((queue_definition) => {

      queue_definition = configureQueueRedrive(queue_definition);

      create_promises.push(sqsutilities.createQueue(queue_definition));

    });

    return Promise.all(create_promises).then(() => {

      du.deep('Create results:', create_promises);

      return queue_definitions;

    });

}

function createDeadletterQueueDefinition(queue) {

    //Note: the JSON method are necessary for parsing
    let dlq_definition = JSON.parse(JSON.stringify(queue));

    dlq_definition.QueueName = createDeadletterQueueName(dlq_definition);

    return dlq_definition;

}

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

  let new_queue_name = queue_name + sqsutilities.deadletter_postfix;

  return new_queue_name;

}

function configureQueueRedrive(queue_definition) {

  du.warning(queue_definition);

  let deadletter_queue_arn = sqsutilities.getQueueARN(createDeadletterQueueName(queue_definition));

  queue_definition.Attributes["RedrivePolicy"] = JSON.stringify({
    deadLetterTargetArn: deadletter_queue_arn,
    maxReceiveCount: max_receive_count
  });

  return queue_definition;

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
