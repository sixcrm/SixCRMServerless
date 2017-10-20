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

//Technical Debt:  Refactor

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
      .then((responses) => this.deleteMessages(responses))
      .then((responses) => this.respond(responses))
      .catch((error) => {
        eu.throwError('server', error);
      });

    }

    //Ultimately, if we're here it's a success...
    respond(responses){

      du.debug('Respond');

      return responses;

    }

    deleteMessage(response){

      du.debug('Delete Message');

      if(_.contains(response.response.result, [this.messages.success, this.messages.failforward])){

        du.warning('Deletes disabled');

        return Promise.resolve(response);
        /*
        return sqs.deleteMessage({
          queue: process.env.origin_queue,
          receipt_handle: response.message.ReceiptHandle
        }).then(() => {
            return response;
        });
        */

      }

      return Promise.resolve(response);

    }

    deleteMessages(responses){

      du.debug('Delete Messages');

      let delete_promises = arrayutilities.map(responses, response => {
        return this.deleteMessage(response);
      });

      return Promise.all(delete_promises);

    }

    handleNoAction(response){

      du.debug('Handle No Action');

      if(!_.has(response.response, 'result')){

        response = this.markResponse(response, 'successnoaction');

      }

      return response;

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

        sqs.sendMessage({message_body: response.response.failed, queue: process.env.failure_queue}, (error, data) => {

          if(_.isError(error)){
            return reject(error);
          }

          response = this.markResponse(response, 'failforward');
          return resolve(response);

        });

      });

    }

    handleFowarding(response){

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

          response = this.markResponse(response, 'success');
          return resolve(response);

        });

      });

    }

    validateResponse(response){

      du.debug('Validate Response');

      mvu.validateModel(response, global.SixCRM.routes.path('model', 'workers/forwardmessage/workerresponse.json'), null, true);

      return Promise.resolve(response);

    }

    handleResponse(response){

      du.debug('Handle Response');

      return this.validateResponse(response)
      .then((response) => {

        return this.handleFailures(response)
        .then((response) => this.handleForwarding(response))
        .then((response) => this.handleNoAction(response));

      })
      .then((response) => {

        this.deleteMessage(response.message);
        return response;

      });

    }

    handleResponses(responses, messages){

      du.debug('Handle Responses');

      let handled_responses = arrayutilities.map(responses, response => {

        return this.handleResponse(response);

      });

      return Promise.all(handled_responses);

    }

    forwardMessage(message){

      du.debug('Forward Message');

      return new Promise((resolve) => {

        let invoke_parameters = {
          function_name: lambda.buildLambdaName(process.env.workerfunction),
          payload: JSON.stringify(message)
        };

        lambda.invokeFunction(invoke_parameters, (error, workerdata) => {

          return resolve({
            response: workerdata,
            message: message,
            error: error
          });

        });

      });

    }

    //Note:  This is the only difference between forwardMessage and forwardMessages...
    forwardMessages(messages){

      du.debug('Forward Messages');

      let message_handler_promises = arrayutilities.map(messages, (message) => {

        return this.forwardMessage(message);

      });

      return Promise.all(message_handler_promises).then(results => {
        du.warning('here');
        du.info(results);
        return results;
      }).catch(error => {
        du.error(error);
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

      if(!_.has(response.response, 'result')){

        response.response.result = this.messages[code];

      }

      return response;

    }

}

module.exports = new forwardMessageController();

    /*
    parseSQSMessage(workerdata_payload){

        return new Promise((resolve, reject) => {

            if(_.isObject(workerdata_payload)){
                resolve(workerdata_payload);
            }else if(_.isString(workerdata_payload)){
                var message;

                try{
                    message = JSON.parse(workerdata_payload);
                }catch(error){
                    reject(error);
                }
                resolve(message);
            }

        });


    }

    parseLambdaResponse(lambda_response){

        return new Promise((resolve, reject) => {

            var parsed_lambda_response;

            if(_.isString(lambda_response)){
                try{
                    parsed_lambda_response = JSON.parse(lambda_response);
                }catch(error){
                    reject(error);
                }

                resolve(parsed_lambda_response);

            }else{

                resolve(lambda_response);

            }

        });

    }

    forwardMessage(){

        du.debug('Forward Message');

        var controller_instance = this;

        return new Promise((resolve, reject) => {

            sqs.receiveMessages({queue: process.env.origin_queue, limit: 10}).then((messages) => {

                if (messages && messages.length > 0) {

                    // If there are 10 messages (maximum), invoke the lambda again so it picks the rest of the messages.
                    if (messages.length === 10) {
                        lambda.invokeFunction({
                          function_name: lambda.buildLambdaName(process.env.name),
                          payload: JSON.stringify({}),
                          invocation_type: 'Event'
                        }); // 'Event' type will make the lambda execute asynchronously.
                    }

                    messages.forEach(function(message) {

                      du.debug('Handling Message:', message);

						          //Technical Debt: in the case of a local context, I want this to invoke a local function...
                      let invoke_parameters = {
                        function_name: lambda.buildLambdaName(process.env.workerfunction),
                        payload: JSON.stringify(message)
                      };

                      lambda.invokeFunction(invoke_parameters, (error, workerdata) => {

                        if(_.isError(error)){
                          reject(error);
                          return;
                        }

                        if(workerdata.StatusCode !== 200){
                          reject(eu.getError('server','Non-200 Status Code returned from Lambda invokation.'));
                        }

                            controller_instance.parseSQSMessage(workerdata.Payload).then((response) => {

                                if(!_.has(response, 'statusCode')){

                                    let error_message = ' Worker data object has unrecognized structure.';

                                    if(_.has(response, 'body')){
                                        error_message += response.body;
                                    }

                                    reject(eu.getError('server',error_message));

                                }

                                if( response.statusCode !== 200){

                                    let error_message = 'Non-200 Status Code returned in workerdata object: ';

                                    if(_.has(response, 'body')){
                                        error_message += response.body;
                                    }
                                    reject(eu.getError('server', error_message));

                                }

                                controller_instance.parseLambdaResponse(response.body).then((response) => {

                                    if(_.has(response, "forward")){

                                        if(_.has(process.env, "destination_queue")){

                                            sqs.sendMessage({message_body: response.forward, queue: process.env.destination_queue}, (error, data) => {

                                                if(_.isError(error)){
                                                    reject(error);
                                                }

                                                return sqs.deleteMessage({queue: process.env.origin_queue, receipt_handle: message.ReceiptHandle})
                                                    .then(() => {
                                                        return resolve(controller_instance.messages.success);
                                                    });

                                            });

                                        }else{

                                            return sqs.deleteMessage({queue: process.env.origin_queue, receipt_handle: message.ReceiptHandle})
                                                .then(() => {
                                                    return resolve(controller_instance.messages.success);
                                                });

                                        }

                                    }else{

                                        if(_.has(process.env, 'failure_queue')){

                                            if(_.has(response, "failed")){

                                                sqs.sendMessage({message_body: response.failed, queue: process.env.failure_queue}, (error, data) => {

                                                    if(_.isError(error)){ reject(error); }

                                                    sqs.deleteMessage({queue: process.env.origin_queue, receipt_handle: message.ReceiptHandle})
                                                        .then(() => {
                                                            return resolve(controller_instance.failforward);
                                                        });

                                                });

                                            }else{

                                                resolve(controller_instance.messages.successnoaction);

                                            }

                                        }else{

                                            resolve(controller_instance.messages.successnoaction);

                                        }

                                    }

                                });

                            });

                        });

                    });

                }else{

                    resolve(this.messages.successnomessages);

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }
    */
