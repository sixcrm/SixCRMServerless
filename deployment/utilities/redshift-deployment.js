'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class RedshiftDeployment extends AWSDeploymentUtilities {

  constructor() {

    super();

    this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

    this.redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

    this.setConfigurationFile();

  }

  setConfigurationFile(){

    du.debug('Get Configuration File');

    if(process.env.stage == 'production'){
        this.configuration_file = global.SixCRM.routes.include('deployment', 'redshift/config/'+process.env.stage+'.json');
    }else{
      this.configuration_file = global.SixCRM.routes.include('deployment', 'redshift/config/default.json');
    }

  }

  getTableNameFromFilename(filename){

    du.debug('Get Table Name From Filename');

    return filename.replace('.sql', '');

  }

}
