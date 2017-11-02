'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const WorkerResponse = global.SixCRM.routes.include('controllers','workers/WorkerResponse.js');
const WorkerRequest = global.SixCRM.routes.include('controllers','workers/WorkerRequest.js');

module.exports = class workerController {

    constructor(){

    }

    parseInputEvent(event, return_field){

      du.debug('Parse Input Event');

      return_field = (_.isUndefined(return_field))?'id':return_field;

      let return_object = null;

      if(_.isObject(event)){

        if(_.isString(return_field) && _.has(event, return_field)){

          return_object = event[return_field];

        }else if(_.has(event, "Body")){

          try{

            let parsed_event = JSON.parse(event.Body);

            if(_.isString(return_field) && _.has(parsed_event, return_field)){

              return_object = parsed_event[return_field];

            }else{

              return_object = parsed_event;

            }

          }catch(error){

            return Promise.reject(error);

          }

        }else{

          return_object = event;

        }

        return Promise.resolve(return_object);

      }else if(_.isString(event)){

        let parsed_event = null;

        try{

          parsed_event = JSON.parse(event);

        }catch(error){

          return Promise.reject(error);

        }

        if(!_.isNull(parsed_event)){

          return this.parseInputEvent(parsed_event, return_field);

        }

      }

      return Promise.reject(eu.getError('server','Unrecognized event format: '+event));

    }

    //Technical Debt: Refactor to the reponse class
    createForwardMessage(event){
      return this.parseInputEvent(event).then((id) => {
        return JSON.stringify({id:id});
      });
    }

    //Technical Debt: This is messy
    acquireRebill(event){

      return this.parseInputEvent(event).then((id) => {

        const rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');

        return rebillController.get({id: id}).then((rebill) => {

          this.validateRebill(rebill);

          return rebill;

        });

      });


    }

    //Technical Debt:  This is messy
    acquireSession(event){

        return this.parseInputEvent(event).then((id) => {

          const sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

            return sessionController.get({id: id}).then((session) => {

                this.validateSession(session)

                return session;

            });

        });

    }

    validateRebill(rebill){

      mvu.validateModel(rebill, global.SixCRM.routes.path('model', 'entities/rebill.json'));

    }

    validateSession(session){

      mvu.validateModel(session, global.SixCRM.routes.path('model', 'entities/session.json'));

    }

    respond(response){

      return new WorkerResponse(response);

    }

}
