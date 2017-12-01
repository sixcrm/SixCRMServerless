'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const RelayResponse = global.SixCRM.routes.include('controllers','workers/components/RelayResponse.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

//Technical Debt:  Test this!
module.exports = class RelayController {

    constructor(){

      this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
      this.lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');

      this.parameter_validation = {
        'params': global.SixCRM.routes.path('model', 'workers/forwardmessage/processenv.json'),
        'messages': global.SixCRM.routes.path('model', 'workers/sqsmessages.json'),
        'workerresponses': global.SixCRM.routes.path('model', 'workers/forwardmessage/compoundworkerresponseobjects.json')
      };

      this.parameters = new Parameters({validation: this.parameter_validation});
    }

    invokeAdditionalLambdas(){

      du.debug('Invoke Additional Lambdas');

      let params = this.parameters.get('params');
      let messages = this.parameters.get('messages');

      if(arrayutilities.nonEmpty(messages) && messages.length >= this.message_limit){

        du.warning('Invoking additional lambda');

        return this.lambdautilities.invokeFunction({
          function_name: this.lambdautilities.buildLambdaName(params.name),
          payload: JSON.stringify({}),
          invocation_type: 'Event' //Asynchronous execution
        }).then(() => {

          return true;

        });

      }

      du.output('No additional lambda required');

      return Promise.resolve(true);

    }

    validateMessages(){

      du.debug('Validate Messages');

      if(!this.parameters.isSet('messages')){
        eu.throwError('server', 'Messages are not set correctly.');
      }

      return Promise.resolve(true);

    }

    getMessages(){

      du.debug('Get Messages');

      if(!_.has(this, 'message_acquisition_function')){

        let params = this.parameters.get('params');

        return this.sqsutilities.receiveMessages({queue: params.origin_queue, limit: this.message_limit}).then((messages) => {
          this.parameters.set('messages', messages);

          return true;
        });

      }else{

        return this.message_acquisition_function();

      }

    }

    validateEnvironment(){

      du.debug('Validate Parameters');

      if(!this.parameters.isSet('params')){
        eu.throwError('server', 'Invalid Forward Message Configuration.');
      }

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

      du.error(message);
      eu.throwError('server', 'Message does not have a receipt handle.');

    }

    createDiagnosticMessageBody(compound_worker_response_object){

      du.debug('Append Diagnostic Information');

      let params = this.parameters.get('params');

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

      message_body.referring_workerfunction = global.SixCRM.routes.path('workers', params.workerfunction);

      return JSON.stringify(message_body);

    }

}
