'use strict';
let _ = require('underscore');
let querystring = require('querystring');
let du = global.routes.include('lib', 'debug-utilities');
const endpointController = global.routes.include('controllers', 'endpoints/endpoint.js');

module.exports = class PublicController extends endpointController {

    constructor(parameters){

        super();

        this.path_fields = ['class', 'method', 'arguments'];

    }

    preprocessing(event){

        du.debug('Preprocessing');

        return this.validateEvent(event)
			.then(this.parseEvent)
      .then(() => this.acquirePathParameters(event))
      .then(() => this.acquireQuerystring(event));

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
        du.highlight (this.pathParameters);

        let path_components = this.pathParameters.arguments.split('/');

        let path_object = {};

        for(var i = 0; i < path_components.length; i++){
            if(!_.isUndefined(this.path_fields[i])){
                if(this.path_fields[i] == 'arguments'){
                    path_object[this.path_fields[i]] = path_components.slice(i).join('/');
                }else{
                    path_object[this.path_fields[i]] = path_components[i];
                }
            }
        }

        this.path_object = path_object;

        return Promise.resolve(path_object);

    }

    validatePath(){

        du.debug('Validate Path');

        du.warning(this.path_object);

        if(!_.has(this.path_object, 'class')){
            return Promise.reject(new Error('The path parameters object requires a class property.'));
        }

        if(!_.has(this.path_object, 'method')){
            return Promise.reject(new Error('The path parameters object requires a method property.'));
        }

      //make sure we have a corresponding class

    }

    instantiateViewController(){

        du.debug('Instantiate View Controller');

        try{

            this.view_controller = global.routes.include('controllers','view/'+this.path_object.class);

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

        return Promise.reject(new Error('View controller lacks appropriate class method: '+this.path_object.method));

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
