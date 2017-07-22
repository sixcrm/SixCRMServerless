'use strict'
const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

module.exports = class AWSUtilities {

    constructor(stage){

      this.stage = configurationutilities.resolveStage(stage);

      this.site_config = configurationutilities.getSiteConfig(this.stage);

    }

    AWSCallback(error, data){

      du.deep('AWS Callback');

      if(error){
        eu.throwError('server', error);
      }

      return data;

    }

}
