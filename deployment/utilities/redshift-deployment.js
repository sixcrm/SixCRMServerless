'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const RedshiftProvider = global.SixCRM.routes.include('controllers', 'providers/redshift-provider.js');

module.exports = class RedshiftDeployment extends AWSDeploymentUtilities {

  constructor() {

    super();

    this.redshiftprovider = new RedshiftProvider();

    this.setConfigurationFile();

  }

  setConfigurationFile(){

    du.debug('Get Configuration File');

    //Technical Debt:  Just make this look for a file that matches the stage name
    if(_.contains(['local', 'local-docker', 'circle', 'development','staging','production'], process.env.stage)){
        this.configuration_file = global.SixCRM.routes.include('deployment', 'redshift/config/'+process.env.stage+'.json');
    }else {
      this.configuration_file = global.SixCRM.routes.include('deployment', 'redshift/config/default.json');
    }

  }

  getTableNameFromFilename(filename){

    du.debug('Get Table Name From Filename');

    return filename.replace('.sql', '');

  }

}
