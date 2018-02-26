'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib','file-utilities.js');

class RDSClusterDeployment {

  constructor() {

    //super();

    this.rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

  }


  createClusterAndWait() {

    du.debug('Create Cluster and Wait');

    let parameters = this.createParametersObject('create');

    return this.appendSecurityGroupIDs(parameters).then((parameters) => {

      return this.redshiftutilities.createCluster(parameters).then(() => {

        parameters = this.createParametersObject('wait');

        return this.redshiftutilities.waitForCluster('clusterAvailable', parameters).then((data) => {

          return this.writeHostConfiguration(data).then(() => {

            return data;

          });

        })

      });

    });

  }

  getParameterConfigurationFromFile(){

    du.debug('Get Parameter Configuration From File.');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment','rds/clusters/')).then(directory_files => {

      let dpcf = arrayutilities.find(directory_files, (directory_file) => {
        return (directory_file == global.SixCRM.configuration.stage+'.json');
      });

      dpcf = (_.isUndefined(dpcf) || _.isNull(dpcf))?'default.json':dpcf;

      return global.SixCRM.routes.include('deployment', 'rds/clusters/'+dpcf);

    });

  }

  deploy() {

    du.debug('Deploy Cluster');

    return this.getParameterConfigurationFromFile()
    .then((parameters) => {
      return this.rdsutilities.putCluster(parameters);
    });

  }

}

module.exports = new RDSClusterDeployment();
