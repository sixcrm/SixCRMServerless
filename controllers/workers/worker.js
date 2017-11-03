'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const permissionutilities = global.SixCRM.routes.include('lib','permission-utilities.js');

const WorkerResponse = global.SixCRM.routes.include('controllers','workers/WorkerResponse.js');
const WorkerRequest = global.SixCRM.routes.include('controllers','workers/WorkerRequest.js');

module.exports = class workerController {

    constructor(){

      //Technical Debt: DANGER!
      permissionutilities.setPermissions('*',['*/*'],[])

    }

    parseMessageBody(message, response_field){

      du.debug('Parse Input Message');

        response_field = (_.isUndefined(response_field))?'id':response_field;

        let message_body;

        try{
          message_body = JSON.parse(message.Body);
        }catch(error){
          du.error(error);
          eu.throwError('server', 'Unable to parse message body: '+message.Body);
        }

        this.validateMessageBody(message_body);

        objectutilities.has(message_body, response_field, true);

        return Promise.resolve(message_body[response_field])

    }

    acquireRebill(message){

      du.debug('Acquire Rebill');

      return this.parseMessageBody(message, 'id')
      .then(id => {

        const rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

        return rebillController.get({id: id}).then((rebill) => {

          this.validateRebill(rebill);

          return rebill;

        });

      });

    }

    acquireSession(message){

      return this.parseMessageBody(message, 'id')
      .then((id) => {

        const sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

        return sessionController.get({id: id}).then((session) => {

          this.validateSession(session);

          return session;

        });

      });

    }

    validateRebill(rebill){

      du.debug('Validate Rebill');

      return mvu.validateModel(rebill, global.SixCRM.routes.path('model', 'entities/rebill.json'));

    }

    validateSession(session){

      du.debug('Validate Session');

      return mvu.validateModel(session, global.SixCRM.routes.path('model', 'entities/session.json'));

    }

    validateMessageBody(message_body){

      du.debug('Validate Message Body');

      mvu.validateModel(message_body, global.SixCRM.routes.path('model', 'workers/hydratedsqsmessagebody.json'));

    }

    respond(response, additional_information){

      response = new WorkerResponse(response);

      if(!_.isUndefined(additional_information)){
        response.setAdditionalInformation(additional_information);
      }

      return response;

    }

}
