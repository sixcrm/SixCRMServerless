'use strict'
const _ = require('underscore');
const request = require('request');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

class HTTPUtilities {

  constructor(){

  }

  postJSON(parameters){

    du.debug('Post JSON');

    let request_options = {
      method: 'post',
      json: true
    };

    request_options = objectutilities.transcribe(
      {
        url:'endpoint'
      },
      parameters,
      request_options
    );

    request_options = objectutilities.transcribe(
      {
        headers:'headers',
        body:'body'
      },
      parameters,
      request_options,
      false
    );

    return this.resolveRequest(request_options);

  }

  resolveRequest(request_options){

    du.debug('Resolve Request');

    return new Promise((resolve, reject) => {

      request(request_options, (error, response, body) => {

        let response_object = {
          error: error,
          response: response,
          body: body
        };

        if(_.isError(error)){
          du.error(error);
          reject(response_object);
        }

        resolve(response_object);

      });

    });

  }

}

module.exports = new HTTPUtilities();
