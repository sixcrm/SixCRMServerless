'use strict';
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var relayController = global.SixCRM.routes.include('controllers', 'workers/relayController.js');

class forwardMessageController extends relayController {

    constructor(){

      super();

      this.message_limit = 10;

    }

    //Technical Debt: Test this
    execute(){

      return this.validateEnvironment() //Make sure that process.env has all necessary parameters
      .then(() => this.getMessages()) //Get messages from origin queue
      .then((messages) => this.validateMessages(messages)) //validate all messages that are returned from the origin queue (What happens if we fail validation?)
      .then((messages) => {

        if(arrayutilities.nonEmpty(messages)){

          return this.invokeAdditionalLambdas(messages) //Trigger another instance of this to handle additional messages
          .then((messages) => this.forwardMessagesToWorkers(messages)) //Send messages to configured worker function

        }else{

          du.highlight('No messages in queue!');
          return [];

        }

      })
      .then((worker_response_objects) => this.handleWorkerResponseObjects(worker_response_objects))
      .then(() => this.respond('success'))
      .catch((error) => {
        du.error(error);
        this.respond('error');
      });

    }

    forwardMessagesToWorkers(messages){

      du.debug('Forward Messages To Workers');

      let worker_promises = [];

      if(_.has(process.env, 'bulk') && process.env.bulk == 'true'){

        worker_promises.push(this.invokeWorker(messages));

      }else{

        arrayutilities.map(messages, (message) => {
          worker_promises.push(this.invokeWorker(message));
        });

      }

      return Promise.all(worker_promises).then((worker_promises) => {
        return worker_promises;
      });

    }

    invokeWorker(message){

      du.debug('invokeWorker');

      let WorkerController = global.SixCRM.routes.include('workers', process.env.workerfunction);

      return WorkerController.execute(message).then(response => {

        if(_.has(process.env, 'bulk') && process.env.bulk == 'true'){
          return {worker_response_object: response, messages: message};
        }

        return {worker_response_object: response, message: message};

      });

    }


    handleWorkerResponseObjects(worker_response_objects){

      du.debug('Handle Worker Response Objects');

      let handle_worker_response_object_promises = arrayutilities.map(worker_response_objects, worker_response_object => {
        return this.handleWorkerResponseObject(worker_response_object);
      });

      return Promise.all(handle_worker_response_object_promises)
      .then(handle_worker_response_object_promises => {
        return handle_worker_response_object_promises;
      });

    }

    handleWorkerResponseObject(worker_response_object){

      du.debug('Handle Worker Response Object');

      return this.validateWorkerResponseObject(worker_response_object)
      .then((worker_response_object) => this.handleError(worker_response_object))
      .then((worker_response_object) => this.handleFailure(worker_response_object))
      .then((worker_response_object) => this.handleSuccess(worker_response_object))
      .then((worker_response_object) => this.handleNoAction(worker_response_object))
      .then((worker_response_object) => this.handleDelete(worker_response_object));

    }

    validateWorkerResponseObject(compound_worker_response_object){

      du.debug('Validate Worker Response Object');

      mvu.validateModel(compound_worker_response_object, global.SixCRM.routes.path('model', 'workers/forwardmessage/compoundworkerresponseobject.json'));

      if(objectutilities.getClassName(compound_worker_response_object.worker_response_object) !== 'WorkerResponse'){
        eu.throwError('server', 'Unrecognized worker response: '+compound_worker_response_object.worker_response_object);
      }

      return Promise.resolve(compound_worker_response_object);

    }

    handleNoAction(compound_worker_response_object){

      du.debug('Handle No Action');

      if(compound_worker_response_object.worker_response_object.getCode() !== 'noaction'){
        return Promise.resolve(compound_worker_response_object);
      }

      du.info('Is noaction.');

      //do nothing anyhow...

      return Promise.resolve(compound_worker_response_object);

    }

    handleFailure(compound_worker_response_object){

      du.debug('Handle Failure');

      if(compound_worker_response_object.worker_response_object.getCode() !== 'fail'){
        return Promise.resolve(compound_worker_response_object);
      }

      du.highlight('Is fail.');

      if(!_.has(process.env, 'failure_queue')){

        du.warning('Fail Queue Not Configured');

        return Promise.resolve(compound_worker_response_object);

      }

      let body = this.createDiagnosticMessageBody(compound_worker_response_object);

      du.info("Updated Message Body: "+body);

      return this.pushMessagetoQueue({body: body, queue: process.env.failure_queue})
      .then(() => { return compound_worker_response_object; });

    }

    handleError(compound_worker_response_object){

      du.debug('Handle Error');

      if(compound_worker_response_object.worker_response_object.getCode() !== 'error'){
        return Promise.resolve(compound_worker_response_object);
      }

      du.highlight('Is error.');

      if(!_.has(process.env, 'error_queue')){

        du.warning('Error Queue Not Configured');

        return Promise.resolve(compound_worker_response_object);

      }

      let body = this.createDiagnosticMessageBody(compound_worker_response_object);

      du.info("Updated Message Body: "+body);

      return this.pushMessagetoQueue({body: body, queue: process.env.error_queue})
      .then(() => { return compound_worker_response_object; });

    }

    handleSuccess(compound_worker_response_object){

      du.debug('Handle Success');

      if(compound_worker_response_object.worker_response_object.getCode() !== 'success'){
        return Promise.resolve(compound_worker_response_object);
      }

      du.info('Is success.');

      if(!_.has(process.env, 'destination_queue')){

        du.warning('Error Queue Not Configured');

        return Promise.resolve(compound_worker_response_object);

      }

      return this.pushMessagetoQueue({body: compound_worker_response_object.message.Body, queue: process.env.destination_queue})
      .then(() => { return compound_worker_response_object; });

    }

    handleDelete(compound_worker_response_object){

      du.debug('Handle Delete');

      if(_.contains(['success', 'fail', 'error'], compound_worker_response_object.worker_response_object.getCode())){
        return this.deleteMessage({
          queue: process.env.origin_queue,
          receipt_handle: this.getReceiptHandle(compound_worker_response_object.message)
        }).then(() => {
          return compound_worker_response_object;
        });
      }else{

        du.debug('Non-delete type: '+compound_worker_response_object.worker_response_object.getCode());

      }

      return Promise.resolve(compound_worker_response_object);

    }

}

module.exports = new forwardMessageController();
