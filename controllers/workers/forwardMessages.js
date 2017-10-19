'use strict';
var _ = require("underscore");
var sqs = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
var lambda = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

/*
*
* This class is complicated.
* The most important thing to note about this class is the following:
* - If the lambda worker function returns a 200 and a response which is JSON
* -- If the JSON has a "forward" object
* --- If the destination queue is configured
* ---- then it'll pass the forward object along
* --- otherwise, it'll just delete the messages
* -- If the JSON has a "failed" object
* --- If the failure queue is configured
* ---- Then it'll forward the object to the failure queue
* -- Otherwise, it'll return a success, no-action event
*
*/

class forwardMessagesController extends workerController {

    constructor(){
        super();
        this.messages = {
            success:'SUCCESS',
            successnoaction:'SUCCESSNOACTION',
            successnomessages:'SUCCESSNOMESSAGES',
            failforward:'FAILFORWARD'
        };
    }

    execute(){

        return this.forwardMessages();

    }

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

    deleteMessages(messages){

        return new Promise((resolve, reject) => {

            let parameters = {
                'messages': messages,
                'queue': process.env.origin_queue
            };

            sqs.deleteMessages(parameters).then((deleted) => {

                return resolve(deleted);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    getMessages(){

        return new Promise((resolve, reject) => {

			//Technical Debt:  This handles a maximum of 10 messages at a time...
			//this should clear the queue where possible...
            sqs.receiveMessages({queue: process.env.origin_queue, limit: 10}).then((messages) => {

                du.debug('Messages', messages);

                return resolve(messages);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    forwardMessages(){

        var controller_instance = this;

        return new Promise((resolve, reject) => {

            this.getMessages().then((messages) => {

                du.highlight('Messages', messages);

                if (_.isArray(messages) && messages.length > 0) {

                    // If there are 10 messages (maximum), invoke the lambda again so it picks the rest of the messages.
                    if (messages.length === 10) {
                        lambda.invokeFunction({
                            function_name: process.env.name,
                            payload: JSON.stringify({}),
                            invocation_type: 'Event'}); // 'Event' type will make the lambda execute asynchronously.
                    }

                    du.debug('Worker function:  ', process.env.workerfunction);

                    let invoke_parameters = {
                        function_name: process.env.workerfunction,
                        payload: JSON.stringify(messages)
                    };

                    du.debug('Invoke parameters:  ', invoke_parameters);

                    lambda.invokeFunction(invoke_parameters).then((workerdata) => {

                        du.debug('Workerdata:', workerdata);

                        if(workerdata.StatusCode !== 200){

                            return reject(eu.getError('server','Non-200 Status Code returned from Lambda invocation.'));

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

                                            this.deleteMessages(messages).then((deleted) => {

                                                return resolve(controller_instance.messages.success);

                                            }).catch((error) => {

                                                return reject(error);

                                            });


                                        });

                                    }else{

                                        this.deleteMessages(messages).then((deleted) => {

                                            return resolve(controller_instance.messages.success);

                                        }).catch((error) => {

                                            return reject(error);

                                        });

                                    }

                                }else{

                                    if(_.has(process.env, 'failure_queue')){

                                        if(_.has(response, "failed")){

                                            sqs.sendMessage({message_body: response.failed, queue: process.env.failure_queue}, (error, data) => {

                                                if(_.isError(error)){ return reject(error); }

                                                this.deleteMessages(messages).then((deleted) => {

                                                    return resolve(controller_instance.messages.failforward);

                                                }).catch((error) => {

                                                    return reject(error);

                                                });

                                            });

                                        }else{

                                            return resolve(controller_instance.messages.successnoaction);

                                        }

                                    }else{

                                        return resolve(controller_instance.messages.successnoaction);

                                    }

                                }

                            });

                        });

                    }).catch((error) => {

                        return reject(error);

                    });

                }else{

                    resolve(this.messages.successnomessages);

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

}

module.exports = new forwardMessagesController();
