'use strict';
const _ = require("underscore");
const sqs = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const lambda = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

/*
*
* This class is complicated.
* The most important thing to note about this class is the following:
* - If the lambda worker function returns a 200 and a response which is JSON
* -- If the JSON has a "forward" object
* --- If the destination queue is configured
* ---- then it'll pass the forward object along
* --- otherwise, it'll just delete the message
* -- If the JSON has a "failed" object
* --- If the failure queue is configured
* ---- Then it'll forward the object to the failure queue
* -- Otherwise, it'll return a success, no-action event
*
*/

class forwardMessageController extends workerController {

    constructor(){

      super();

      this.messages = {
        success:'SUCCESS',
        successnoaction:'SUCCESSNOACTION',
        successnomessages:'SUCCESSNOMESSAGES',
        failforward:'FAILFORWARD'
      };

      this.message_limit = 10;

    }

    execute(event){

      du.warning(event);

      return this.validateRequest()
      .then(() => this.getMessages())
      .then((messages) => this.validateMessages(messages))
      .then((messages) => {

        if(arrayutilities.nonEmpty(messages)){

          return this.invokeAdditionalLambdas(messages)
          .then((messages) => this.forwardMessages(messages))
          .then((responses) => this.handleResponses(responses));

        }

        return [];

      })
      .then((responses) => this.respond(responses))
      .catch((error) => {
        eu.throwError('server', error);
      });

    }

    //Ultimately, if we're here it's a success...
    respond(responses){

      du.debug('Respond');

      du.warning(responses);

      return responses;

    }

    deleteMessage(response, message_receipt_handle){

      du.debug('Delete Message');

      if(_.contains(response.result, [this.messages.success, this.messages.failforward])){

        return sqs.deleteMessage({
          queue: process.env.origin_queue,
          receipt_handle: message_receipt_handle
        }).then(() => {
            return response;
        });

      }

      return Promise.resolve(response);

    }

    handleNoAction(response){

      du.debug('Handle No Action');

      if(!_.has(response, 'result')){

        response = this.markResponse(response, 'successnoaction');

      }

      return Promise.resolve(response);

    }

    handleFailures(response){

      du.debug('Handle Failures');

      return new Promise((resolve, reject) => {

        if(!_.has(response, "failed")){
          return resolve(response);
        }

        if(!_.has(process.env, 'failure_queue')){
          return resolve(response);
        }

        sqs.sendMessage({message_body: response.failed, queue: process.env.failure_queue}, (error, data) => {

          if(_.isError(error)){
            return reject(error);
          }

          return resolve(this.markResponse(response, 'failforward'));

        });

      });

    }

    handleForwarding(response){

      du.debug('Handle Forwarding');

      return new Promise((resolve, reject) => {

        if(!_.has(response, "forward")){
          return resolve(response);
        }

        if(!_.has(process.env, "destination_queue")){
          return resolve(response);
        }

        sqs.sendMessage({message_body: response.forward, queue: process.env.destination_queue}, (error, data) => {

          if(_.isError(error)){
            return reject(error);
          }

          return resolve(this.markResponse(response, 'success'));

        });

      });

    }

    validateLambdaResponse(response){

      du.debug('Validate Lambda Response');

      mvu.validateModel(response, global.SixCRM.routes.path('model', 'workers/forwardmessage/lambdaresponse.json'), null, true);

      return Promise.resolve(response);

    }

    validateWorkerLambdaResponse(response){

      du.debug('Validate Worker Response');

      mvu.validateModel(response, global.SixCRM.routes.path('model', 'workers/forwardmessage/workerlambdaresponse.json'), null, true);

      return Promise.resolve(response);

    }

    validateWorkerControllerResponse(response){

      du.debug('Validate Worker Response');

      mvu.validateModel(response, global.SixCRM.routes.path('model', 'workers/forwardmessage/workercontrollerresponse.json'), null, true);

      return Promise.resolve(response);

    }

    validateForwardMessage(forwardmessage){

      du.debug('Validate Forward Message');

      mvu.validateModel(forwardmessage, global.SixCRM.routes.path('model', 'workers/forwardmessage/forwardmessage.json'), null, true);

      return Promise.resolve(forwardmessage);

    }

    parseLambdaResponsePayload(response){

      du.debug('Parse Lambda Response');

      response = response.Payload;

      try{
        response = JSON.parse(response);
      }catch(error){
        du.error('JSON Parse Error: ', error);
      }

      return response;

    }

    parseWorkerLambdaResponseBody(response){

      du.debug('Parse Lambda Response');

      response = response.body;

      try{
        response = JSON.parse(response);
      }catch(error){
        du.error('JSON Parse Error: ', error);
      }

      return response;

    }

    handleResponse(forwardmessage){

      du.debug('Handle Response');

      return this.validateForwardMessage(forwardmessage)
      .then((forwardmessage) => {
        return forwardmessage.response;
      })
      .then((response) => this.validateLambdaResponse(response))
      .then((response) => this.parseLambdaResponsePayload(response))
      .then((response) => this.validateWorkerLambdaResponse(response))
      .then((response) => this.parseWorkerLambdaResponseBody(response))
      .then((response) => this.validateWorkerControllerResponse(response))
      .then((response) => {

        return this.handleFailures(response, forwardmessage)
        .then((response) => this.handleForwarding(response, forwardmessage))
        .then((response) => this.handleNoAction(response, forwardmessage));

      })
      .then((response) => {

        return this.deleteMessage(response, forwardmessage.message.ReceiptHandle)
        .then((delete_response) => {

          du.info('Delete Response:', delete_response);

          return response;

        });

      });

    }

    handleResponses(forwardmessages){

      du.debug('Handle Responses');

      let handled_forwardmessages_promises = arrayutilities.map(forwardmessages, forwardmessage => {

        return this.handleResponse(forwardmessage);

      });

      return Promise.all(handled_forwardmessages_promises).then(handled_forwardmessages_promises => {
        //validate?
        return handled_forwardmessages_promises;

      });

    }

    forwardMessage(message){

      du.debug('Forward Message');

      let invoke_parameters = {
        function_name: lambda.buildLambdaName(process.env.workerfunction),
        payload: JSON.stringify(message)
      };

      return lambda.invokeFunction(invoke_parameters).then(response => {

        return response;

      })
      .then((response) => {
        if(_.isError(response)){
          return this.assembleForwardMessageResponseObject(null, message, response);
        }
        return this.assembleForwardMessageResponseObject(response, message, null);
      });

    }

    assembleForwardMessageResponseObject(response, message, error){

      du.debug('Assemble Forward Message Response Object');

      return {
        response: response,
        message: message,
        error: error
      };

    }

    forwardMessages(messages){

      du.debug('Forward Messages');

      let message_handler_promises = [];

      if(_.has(process.env, 'bulk') && process.env.bulk == 'true'){

        //Note:  This is the only difference between forwardMessage and forwardMessages...
        message_handler_promises.push(this.forwardMessage(messages));

      }else{

        message_handler_promises = arrayutilities.map(messages, (message) => {

          return this.forwardMessage(message);

        });

      }

      return Promise.all(message_handler_promises).then(results => {
        return results;
      }).catch(error => {
        du.error(error);
        process.exit();
      });

    }

    invokeAdditionalLambdas(messages){

      du.debug('Invoke Additional Lambdas');

      if(arrayutilities.nonEmpty(messages) && messages.length >= this.message_limit){

        du.warning('Invoking additonal Lambdas');

        return lambda.invokeFunction({
          function_name: lambda.buildLambdaName(process.env.name),
          payload: JSON.stringify({}),
          invocation_type: 'Event' //Asynchronous execution
        }).then(() => {
          return messages;
        });

      }

      du.warning('No additonal Lambdas');

      return Promise.resolve(messages);

    }

    validateMessages(messages){

      du.debug('Validate Messages');

      mvu.validateModel(messages, global.SixCRM.routes.path('model', 'workers/forwardmessage/sqsmessages.json'), null, true);

      return Promise.resolve(messages);

    }

    getMessages(){

      du.debug('Get Messages');

      return sqs.receiveMessages({queue: process.env.origin_queue, limit: this.message_limit}).then(results => {
        du.info(results);
        return results;
      });

    }

    validateRequest(){

      du.debug('Validate Request');

      objectutilities.hasRecursive(process, 'env.origin_queue', true);

      objectutilities.hasRecursive(process, 'env.name', true);

      objectutilities.hasRecursive(process, 'env.workerfunction', true);

      return Promise.resolve(true);

    }

    markResponse(response, code){

      du.debug('Mark Response');

      if(!_.has(response, 'result')){

        response.result = this.messages[code];

      }

      return response;

    }

}

module.exports = new forwardMessageController();
