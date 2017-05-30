'use strict';
const _ = require("underscore");
const querystring = require('querystring');

const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = class EndpointController {

    constructor(){

    }

    acquireBody(event){

        du.debug('Acquire Body');

        var duplicate_body;

        try {
            duplicate_body = JSON.parse(event['body']);
        } catch (e) {
            duplicate_body = event.body;
        }

        return Promise.resolve(duplicate_body);

    }

    acquireQuerystring(event){

        du.debug('Acquire Querystring');

        return new Promise((resolve, reject) => {

            var duplicate_querystring = event.queryStringParameters;

            if(!_.isObject(duplicate_querystring)){

                if(_.isString(duplicate_querystring)){

                    try{

                        duplicate_querystring = querystring.parse(duplicate_querystring);

                    }catch(error){

                        return reject(error);

                    }

                    resolve(duplicate_querystring);

                }else{

                    return reject(new Error('Request querystring is an unexpected format.'));

                }

            }else{

                return resolve(duplicate_querystring);

            }

        });

    }

    validateEvent(event){

        du.debug('Validate Event');

        return new Promise((resolve, reject) => {

            du.highlight('Event:', event);

            if(!_.has(event, 'requestContext')){
                return reject(new Error('Missing requestContext'));
            }

            if(!_.has(event, 'pathParameters')){
                return reject(new Error('Missing pathParameters'));
            }

            return resolve(event);

        });

    }

    parseEvent(event){

        du.debug('Parse Event');

        return new Promise((resolve, reject) => {

            if(!_.isObject(event)){

                try{

                    event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));

                }catch(error){

                    return reject(error);

                }

            }

            if(!_.isObject(event.requestContext)){

                try{

                    event.requestContext = JSON.parse(event.requestContext);

                }catch(error){

                    return reject(error);

                }

            }

            if(!_.isObject(event.pathParameters)){

                try{

                    event.pathParameters = JSON.parse(event.pathParameters);

                }catch(error){

                    return reject(error);

                }

            }

            return resolve(event);

        });

    }

}
