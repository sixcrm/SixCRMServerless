'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const random = global.SixCRM.routes.include('lib', 'random.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js')

class STSUtilities extends AWSUtilities {

  constructor(){

    super();

    this.sts = new AWS.STS({apiVersion: '2011-06-15'});

  }

  assumeRole(parameters){

    du.debug('Assume Role');

    let transcribe_parameters = {
      required:{
        RoleArn:'RoleArn'
      },
      optional:{
        DurationSeconds: 'DurationSeconds',
        RoleSessionName: 'RoleSessionName',
        Policy:'Policy',
        ExternalId:'ExternalId'
      }
    };

    let new_parameters = objectutilities.transcribe(transcribe_parameters.required, parameters, {}, true);

    new_parameters = objectutilities.transcribe( transcribe_parameters.optional, parameters, new_parameters, false);

    if(!_.has(new_parameters.RoleSessionName)){
      new_parameters.RoleSessionName = random.createRandomString(20);
    }

    mvu.validateModel(new_parameters, global.SixCRM.routes.path('model', 'deployment/sts/assumerolerequest.json'))
    return new Promise((resolve) => {

      return this.sts.assumeRole(new_parameters, (error, data) => resolve(this.AWSCallback(error, data)))

    });

  }

}

module.exports = new STSUtilities();
