'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const RelayResponse = global.SixCRM.routes.include('controllers','workers/RelayResponse.js');

//Technical Debt:  Test this!
module.exports = class relayController {

    constructor(){

      this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
      this.lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');

    }

    invokeAdditionalLambdas(messages){

      du.debug('Invoke Additional Lambdas');

      if(arrayutilities.nonEmpty(messages) && messages.length >= this.message_limit){

        du.warning('Invoking additional lambda');

        return this.lambdautilities.invokeFunction({
          function_name: this.lambdautilities.buildLambdaName(process.env.name),
          payload: JSON.stringify({}),
          invocation_type: 'Event' //Asynchronous execution
        }).then(() => {
          return messages;
        });

      }

      du.output('No additional lambda required')

      return Promise.resolve(messages);

    }

    validateMessages(messages){

      du.debug('Validate Messages');

      mvu.validateModel(messages, global.SixCRM.routes.path('model', 'workers/sqsmessages.json'));

      return Promise.resolve(messages);

    }

    getMessages(){

      du.debug('Get Messages');

      return this.sqsutilities.receiveMessages({queue: process.env.origin_queue, limit: this.message_limit}).then(results => {
        return results;
      });

    }

    validateEnvironment(){

      du.debug('Validate Request');

      mvu.validateModel(process.env, global.SixCRM.routes.path('model', 'workers/forwardmessage/processenv.json'));

      return Promise.resolve(true);

    }

    deleteMessage({queue, receipt_handle}){

      du.debug('Delete Message');

      return this.sqsutilities.deleteMessage({
        queue: queue,
        receipt_handle: receipt_handle
      });

    }

    respond(response){

      du.debug('Respond');

      return new RelayResponse(response);

    }

    pushMessagetoQueue({body, queue}){

      du.debug('Push Message To Queue');

      return new Promise((resolve, reject) => {

        this.sqsutilities.sendMessage({message_body: body, queue: queue}, (error, data) => {

          if(_.isError(error)){
            return reject(error);
          }

          return resolve(null);

        });

      });

    }

    getReceiptHandle(message){

      du.debug('Get Receipt Handle');

      if(_.has(message, 'ReceiptHandle')){
        return message.ReceiptHandle;
      }

      eu.throwError('server', 'Message does not have a receipt handle.');

    }

    createDiagnosticMessageBody(compound_worker_response_object){

      du.debug('Append Diagnostic Information');

      objectutilities.hasRecursive(compound_worker_response_object, 'message.Body', true);

      let message_body = compound_worker_response_object.message.Body;

      try{
        message_body = JSON.parse(message_body);
      }catch(error){
        return message_body;
      }

      let additional_information = compound_worker_response_object.worker_response_object.getAdditionalInformation();

      if(!_.isNull(additional_information)){
        message_body.additional_information = additional_information;
      }

      objectutilities.hasRecursive(process, 'env.workerfunction', true);

      message_body.referring_workerfunction = global.SixCRM.routes.path('workers',process.env.workerfunction);

      return JSON.stringify(message_body);

    }

}
