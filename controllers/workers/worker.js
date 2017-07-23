'use strict';
const Validator = require('jsonschema').Validator;
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const rebillController = global.SixCRM.routes.include('controllers','entities/Rebill.js');
const sessionController = global.SixCRM.routes.include('controllers','entities/Session.js');

module.exports = class workerController {

    constructor(){

    }

    parseInputEvent(event){

        return new Promise((resolve, reject) => {

            if(_.isObject(event)){

				//object of structure {id:"blah-blah"}
                if(_.has(event, 'id')){

					//useful for local success_event.json inclusion
                    resolve(event.id);

				//object of structure {... Body:'{\n  "id": "55c103b4-670a-439e-98d4-5a2834bb5fc3"\n}'}
				//This is normally what's going to be coming back from SQS
                }else if(_.has(event, "Body")){

                    try{

                        let parsed_event = JSON.parse(event.Body);

                        if(_.has(parsed_event, 'id')){
                            resolve(parsed_event.id);
                        }

                    }catch(error){
                        reject(error);
                    }

				//if, somehow the function was passed a raw id 'blah-blah'
                }else{

					//might be garbage...
                    resolve(event);

                }

			// if event is '{"id":"blah-blah"}'
            }else if(_.isString(event)){

                try{
                    let parsed_event = JSON.parse(event);

                    if(_.has(parsed_event, 'id')){
                        resolve(parsed_event.id);
                    }

                }catch(error){
                    reject(error);
                }

            }else{

                reject(eu.getError('validation','Unrecognized event format: '+event));

            }

        });

    }

    createForwardMessage(event){
        return this.parseInputEvent(event).then((id) => {
            return JSON.stringify({id:id});
        });
    }

    acquireRebill(event){

        return this.parseInputEvent(event).then((id) => {

			//let's add a hydration method here...
            return rebillController.get(id).then((rebill) => {

                return this.validateRebill(rebill);

            });

        });


    }

    acquireSession(event){

        return this.parseInputEvent(event).then((id) => {

			//let's add a hydration method here...
            return sessionController.get(id).then((session) => {

                return this.validateSession(session);

            });

        });

    }

    validateRebill(rebill){

        return new Promise((resolve, reject) => {

            try{

                var rebill_schema = global.SixCRM.routes.include('model','entities/rebill.json');

            } catch(e){

                reject(eu.getError('server','Unable to load validation schemas. Error:' + e));

            }

            var validation;

            try{
                var v = new Validator();

                validation = v.validate(rebill, rebill_schema);
            }catch(e){
                reject(e.message);
            }

            if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                var error = {
                    message: 'One or more validation errors occurred.',
                    issues: validation.errors.map((e) => { return e.message; })
                };

                reject(eu.getError('server',error.message));

            }

            resolve(rebill);

        });

    }

    validateSession(session){

        return new Promise((resolve, reject) => {

            try{

                var session_schema = global.SixCRM.routes.include('model','entities/session.json');

            } catch(e){

                return reject(eu.getError('server','Unable to load validation schemas. Error:' + e));

            }

            var validation;

            try{
                var v = new Validator();

                validation = v.validate(session, session_schema);
            }catch(e){
                return reject(e);
            }

            if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                var error = {
                    message: 'One or more validation errors occurred.',
                    issues: validation.errors.map((e) => { return e.message; })
                };

                du.warning(validation.errors);

                return reject(error);

            }

            return resolve(session);

        });

    }

}
