'use strict';
let _ = require('underscore');
let encodeutilities = global.SixCRM.routes.include('lib', 'encode.js');
let du = global.SixCRM.routes.include('lib', 'debug-utilities');
let eu = global.SixCRM.routes.include('lib', 'error-utilities');
const endpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/endpoint.js');

module.exports = class PublicController extends endpointController {

    constructor(){

        super();

        this.path_fields = ['class', 'method', 'arguments'];

    }

    preprocessing(event){

      du.debug('Preprocessing');

      return this.normalizeEvent(event)
      .then((event) => this.validateEvent(event))
      .then((event) => this.acquirePathParameters(event))
      .then((event) => this.parseEventQueryString(event));
    }

    //Technical Debt:  Redundant?
    parseEventQueryString(event){

      du.debug('Parse Event Query String');

      return super.parseEventQueryString(event).then(event => {

        if(_.has(event, 'queryStringParameters')){
          this.queryString = event.queryStringParameters;
        }

        return event;

      });

    }

    routeRequest(){
        du.debug('Route Request');
        return this.parsePathParameters()
      .then(() => this.validatePath())
      .then(() => this.instantiateViewController())
      .then(() => this.validateViewController())
      .then(() => this.createArgumentationObject())
      .then(() => this.invokeViewController());
    }

    parsePathParameters(){

        du.debug('Parse Path Parameters');

        let path_object = {};

        if(_.has(this.pathParameters, 'encoded')){
            path_object = encodeutilities.base64ToObject(this.pathParameters.encoded);
        }

        this.path_object = path_object;

        return Promise.resolve(path_object);

    }

    validatePath(){

        du.debug('Validate Path');

        if(!_.has(this.path_object, 'class')){
            return Promise.reject(eu.getError('bad_request', 'The path parameters object requires a class property.'));
        }

        if(!_.has(this.path_object, 'method')){
            return Promise.reject(eu.getError('bad_request', 'The path parameters object requires a method property.'));
        }

        //Technical Debt:  Make sure that the class exists in the views directory

    }

    instantiateViewController(){

        du.debug('Instantiate View Controller');

        try{

            this.view_controller = global.SixCRM.routes.include('controllers','view/'+this.path_object.class);

        }catch(error){

            return Promise.reject(error);

        }

        return Promise.resolve(true);

    }

    validateViewController(){

        du.debug('Instantiate View Controller');

        if(_.has(this, 'view_controller') && _.isFunction(this.view_controller[this.path_object.method])){

            return Promise.resolve(true);

        }

        return Promise.reject(eu.getError('bad_request', 'View controller lacks corresponding class method: '+this.path_object.method));

    }

    createArgumentationObject(){

        du.debug('Create Argumentation Object');

        this.argumentation_object = {
            pathParameters: this.path_object,
            queryString: this.queryString
        };

        return Promise.resolve(true);

    }


    invokeViewController(){

        du.debug('Invoke View Controller');

        return this.view_controller[this.path_object.method](this.argumentation_object);

    }

}
