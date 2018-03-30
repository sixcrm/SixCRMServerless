'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class SQSDeployment extends AWSDeploymentUtilities{

    constructor() {

      super();

      this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

    }

    purgeQueues(){

      du.debug('Purge Queues');

      return this.getQueueDefinitions().then((queue_definitions) => {

        let purge_queue_promises = arrayutilities.map(queue_definitions, (queue_definition) => {

          if(!_.has(queue_definition, 'QueueName')){
            eu.throwError('server', 'Queue definition lacks QueueName property');
          }

          let queue_name = queue_definition.QueueName;
          let deadletter_queue_name = this.createDeadletterQueueName(queue_name);

          return () => this.sqsutilities.purgeQueue(queue_name).then(() => this.sqsutilities.purgeQueue(deadletter_queue_name));

        });

        return arrayutilities.serial(purge_queue_promises).then(() => {

          return 'Complete';

        });

      });

    }

    deployQueues(){

      du.debug('Deploy Queues');

      let number_of_created_queues = 0;

      return this.getQueueDefinitions().then((queue_definitions) => {

        let create_queue_promises = arrayutilities.map(queue_definitions, (queue_definition) => {

          if(!_.has(queue_definition, 'QueueName')){ eu.throwError('server', 'Queue definition lacks QueueName property'); }

          let deadletter_queue_definition = this.createDeadLetterQueueDefinition(queue_definition);

          return () => this.createQueue(deadletter_queue_definition).then(() => {

            queue_definition = this.addQueueRedrivePolicy(queue_definition);

            return this.createQueue(queue_definition).then((result) => {

              if(result == false){
                du.highlight('Queue Exists');
              } else {
                du.highlight('Queue Created');
                number_of_created_queues++;
              }

              return true;

            });

          });

        });

        return arrayutilities.serial(create_queue_promises).then(() => {

          du.highlight('Pausing to allow AWS to catch up...');

          if (number_of_created_queues > 0) {
              return timestamp.delay(60000)().then(() => {
                  return 'Complete';
              });
          } else {
              return 'Complete';
          }

        });

      });

    }

    createQueue(queue_definition){

      du.debug('Create Queue');

      return this.sqsutilities.createQueue(queue_definition);

    }

    destroyQueues(){

      du.debug('Destroy Queues');

      return this.getQueueDefinitions().then((queue_definitions) => {

        let delete_queue_promises = arrayutilities.map(queue_definitions, (queue_definition) => {

          if(!_.has(queue_definition, 'QueueName')){
            eu.throwError('server', 'Queue definition lacks QueueName property');
          }

          let queue_name = queue_definition.QueueName;
          let deadletter_queue_name = this.createDeadletterQueueName(queue_name);

          return () => this.sqsutilities.deleteQueue(queue_name).then(() => this.sqsutilities.deleteQueue(deadletter_queue_name));

        });

        return arrayutilities.serial(delete_queue_promises)
        .then(() => {

          du.highlight('Pausing to allow AWS to catch up...');

          return timestamp.delay(60000)().then(() => { return 'Complete'; });

        });

      });

    }

    getQueueDefinitions(){

      du.debug('Get Queue Definitions');

      let sqs_definitions_directory = global.SixCRM.routes.path('deployment', 'sqs/queues');

      return fileutilities.getDirectoryFiles(sqs_definitions_directory).then((queue_definition_filenames) => {

        let queue_definitions = arrayutilities.map(queue_definition_filenames, (queue_definition_filename) => {
          return global.SixCRM.routes.include('deployment', 'sqs/queues/'+queue_definition_filename);
        });

        return queue_definitions;

      });

    }

    addQueueRedrivePolicy(queue_definition){

      du.debug('Add Queue Redrive Policy')

      let deadletter_queue_arn = this.sqsutilities.getQueueARN(this.createDeadletterQueueName(queue_definition));

      queue_definition.Attributes.RedrivePolicy = JSON.stringify({
        deadLetterTargetArn: deadletter_queue_arn,
        maxReceiveCount: global.SixCRM.configuration.site_config.sqs.max_receive_count
      });

      return queue_definition;

    }

    createDeadLetterQueueDefinition(queue_definition){

      du.debug('Create Deadletter Queue Definition');

      let queue_definition_clone = objectutilities.clone(queue_definition);

      if(!_.has(queue_definition, 'QueueName')){
        eu.throwError('server', 'Queue definition lacks QueueName property');
      }

      queue_definition_clone.QueueName = this.createDeadletterQueueName(queue_definition);

      return queue_definition_clone;

    }

    createDeadletterQueueName(queue_name){

      du.debug('Create Deadletter Queue Name');

      if(_.isObject(queue_name)){
        if(_.has(queue_name, 'QueueName')){
          queue_name = queue_name.QueueName;
        }else{
          eu.throwError('server', 'Missing QueueName property');
        }
      }

      if(!_.isString(queue_name)){
        eu.throwError('server', 'Improper argumentation for createDeadletterQueueName');
      }

      return queue_name + global.SixCRM.configuration.site_config.sqs.deadletter_postfix;

    }

}
