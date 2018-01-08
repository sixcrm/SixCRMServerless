'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class workerController {

    constructor(){

      this.setPermissions();
      this.initialize();

    }

    setPermissions(){

      du.debug('Set Permissions');

      this.permissionutilities = global.SixCRM.routes.include('lib','permission-utilities.js');
      this.permissionutilities.setPermissions('*',['*/*'],[])

    }

    initialize(){

      du.debug('Initialize');

      let parameter_validation = {
        'message': global.SixCRM.routes.path('model', 'workers/sqsmessage.json'),
        'messages':global.SixCRM.routes.path('model', 'workers/sqsmessages.json'),
        'parsedmessagebody': global.SixCRM.routes.path('model', 'workers/parsedmessagebody.json'),
        'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
        'session': global.SixCRM.routes.path('model', 'entities/session.json'),
        'responsecode': global.SixCRM.routes.path('model', 'workers/workerresponsetype.json')
      }

      let parameter_definition = {};

      const ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

      this.parameters = new ParametersController({
        validation: parameter_validation,
        definition: parameter_definition
      });

    }

    augmentParameters(){

      du.debug('Augment Parameters');

      this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
      this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

      return true;

    }

    preamble(message){

      du.debug('Preamble');

      return this.setParameters({argumentation: {message: message}, action: 'execute'})
      .then(() => this.parseMessageBody())
      .then(() => this.acquireRebill());

    }

    setParameters(parameters_object){

      du.debug('Set Parameters');

      this.parameters.setParameters(parameters_object);

      return Promise.resolve(true);

    }

    //Technical Debt: This is kind of gross...
    parseMessageBody(message, response_field){

      du.debug('Parse Message Body');

      response_field = this.setResponseField(response_field);
      message = this.setMessage();

      let message_body;

      try{
        message_body = JSON.parse(message.Body);
      }catch(error){
        du.error(error);
        eu.throwError('server', 'Unable to parse message body: '+message);
      }

      objectutilities.hasRecursive(message_body, response_field, true);

      this.parameters.set('parsedmessagebody', message_body);

      return Promise.resolve(true);

    }

    setMessage(message){

      du.debug('Set Message');

      if(!_.isUndefined(message) && !_.isNull(message) && objectutilities.isObject(message, false)){
        return message;
      }

      return this.parameters.get('message');

    }

    setResponseField(response_field){

      du.debug('Set Response Field');

      if(!_.isUndefined(response_field) && !_.isNull(response_field) && stringutilities.isString(response_field, false)){
        return response_field;
      }

      if(_.has(this, 'response_field')){
        return this.response_field;
      }

      return 'id';

    }

    acquireRebill(){

      du.debug('Acquire Rebill');

      let parsed_message_body = this.parameters.get('parsedmessagebody');

      if(!_.has(this, 'rebillController')){
        this.rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
      }

      return this.rebillController.get({id: parsed_message_body.id}).then((rebill) => {

        this.parameters.set('rebill', rebill);

        return true;

      });

    }

    acquireSession(){

      du.debug('Acquire Session');

      let parsed_message_body = this.parameters.get('parsedmessagebody');

      if(!_.has(this, 'sessionController')){
        this.sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
      }

      return this.sessionController.get({id: parsed_message_body.id}).then((session) => {

        this.parameters.set('session', session);

        return true;

      });

    }

    respond(response, additional_information){

      du.debug('Respond');

      const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');

      response = new WorkerResponse(response);

      if(!_.isUndefined(additional_information)){
        response.setAdditionalInformation(additional_information);
      }

      return response;

    }

}
