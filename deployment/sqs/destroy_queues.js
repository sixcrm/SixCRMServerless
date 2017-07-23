'use strict';
require('../../SixCRM.js');
const _ = require('underscore');
const fs = require('fs');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

return getQueueDefinitions()
.then(queueDefinitions => deleteQueues(queueDefinitions))
//Technical Debt:  we should just check the status of the operations with AWS CLI
.then((queueDefinitions) => {
    du.highlight('Pausing for deletes...');
    return queueDefinitions;
})
.then(timestamp.delay(70000))
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
      delete_promises.push(sqsutilities.deleteQueue(queue_definition.QueueName));
      delete_promises.push(sqsutilities.deleteQueue(createDeadletterQueueName(queue_definition)));
    });

    return Promise.all(delete_promises).then(() => {
        return queue_definitions;
    });

}

function getQueueDefinitions(){

  const files = fs.readdirSync(global.SixCRM.routes.path('deployment', 'sqs/queues'));

  const queue_objects = files.map((file) => {

    du.debug('Queue Definition File: '+file);

    return global.SixCRM.routes.include('deployment', 'sqs/queues/'+file);

  });

  return Promise.resolve(queue_objects);

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
