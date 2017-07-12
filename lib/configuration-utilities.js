'use strict'
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

module.exports = class ConfigurationUtilities{

  static getSiteConfig(stage){

    du.debug('Get Site Config');

    stage = this.resolveStage(stage);

    let config = global.routes.include('config', stage+'/site.yml');

    if (!config) {
      eu.throwError('server', 'ConfigurationUtilities.getSiteConfig was unable to identify file '+global.routes.path('config', stage+'/site.yml'));
    }

    return config;

  }

  static getServerlessConfig(){

    du.debug('Get Serverless Config');

    return global.routes.include('root', 'serverless.yml');

  }

  static resolveStage(stage){

    du.debug('Resolve Stage');

    if(_.isUndefined(stage)){

      if(_.has(process.env, 'stage')){

        stage = process.env.stage;

      }else{

        eu.throwError('server', 'ConfigurationUtilities.resolveStage unable to determine stage.');

      }

    }

    if(!_.contains(['local','development','staging','production'], stage)){

      eu.throwError('ConfigurationUtilities.resolveStage unable to validate stage name: '+stage);

    }

    return stage;

  }

}
