'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

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
        'parsedmessagebody': global.SixCRM.routes.path('model', 'workers/parsedmessagebody.json')
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
      .this(() => this.parseMessageBody())
      .then(() => this.acquireRebill());

    }

    setParameters(parameters_object){

      du.debug('Set Parameters');

      this.parameters.setParameters(parameters_object);

      return Promise.resolve(true);

    }

    //Technical Debt: This is kind of gross...
    parseMessageBody(){

      du.debug('Parse Input Message');

      let response_field = (_.has(this, 'response_field'))?this.response_field:'id';

      let message = this.parameters.get('message');

      let message_body;

      try{
        message_body = JSON.parse(message.Body);
      }catch(error){
        du.error(error);
        eu.throwError('server', 'Unable to parse message body: '+message.Body);
      }

      objectutilities.hasRecursive(message_body, response_field, true);

      this.parameters.set('parsedmessagebody', message_body);

      return Promise.resolve(true);

    }

    acquireRebill(){

      du.debug('Acquire Rebill');

      let message = this.parameters.get('message');

      return this.parseMessageBody(message, 'id').then(id => {

        if(!_.has(this, 'rebillController')){
          this.rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
        }

        return this.rebillController.get({id: id}).then((rebill) => {

          this.parameters.set('rebill', rebill);

          return true;

        });

      });

    }

    acquireSession(message){

      du.debug('Acquire Session');

      return this.parseMessageBody(message, 'id').then((id) => {

        if(!_.has(this, 'sessionController')){
          this.sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');
        }

        return this.sessionController.get({id: id}).then((session) => {

          this.parameters.set('session', session);

          return true;

        });

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
