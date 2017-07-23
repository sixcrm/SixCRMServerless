'use strict';
require('../../SixCRM.js');
const _ = require('underscore');
const fs = require('fs');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

//Technical Debt:  This should be configured.
const max_receive_count = 5;

du.highlight(`Executing SQS Deployment`);

return getQueueDefinitions()
.then((queue_definitions) => createDeadletterQueues(queue_definitions))
.then((queue_definitions) => createQueues(queue_definitions))
.then(() => {
  du.highlight('Queue Creation Complete')
})
.catch((error) => {
    du.error(error);
    eu.throwError('server', error);
});

function getQueueDefinitions(){

  const files = fs.readdirSync(global.SixCRM.routes.path('deployment', 'sqs/queues'));

  const queue_objects = files.map((file) => {

    du.debug('Queue Definition File: '+file);

    return global.SixCRM.routes.include('deployment', 'sqs/queues/'+file);

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
