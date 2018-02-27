'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
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
    .then((parameters) => this.parseParameters(parameters))
    .then((parameters) => {
      return this.rdsutilities.putCluster(parameters).then(result => {
        du.info(result);
        return parameters;
      });
    })
    .then((parameters) => this.deployClusterInstances(parameters))
    .then(() => {
      return 'Complete';
    });

  }

  parseParameters(parameters){

    du.debug('Parse Parameters');

    let parser_data = {
      region: global.SixCRM.configuration.site_config.aws.region,
      stage:global.SixCRM.configuration.stage,
      account: global.SixCRM.configuration.site_config.aws.account
    };

    objectutilities.map(parameters, key => {
      if(_.isString(parameters[key])){
        parameters[key] = parserutilities.parse(parameters[key], parser_data);
      }
      if(_.isArray(parameters[key]) && arrayutilities.nonEmpty(parameters[key])){
        parameters[key] = arrayutilities.map(parameters[key], a_parameter_value => {
          if(_.isString(a_parameter_value)){
            return parserutilities.parse(a_parameter_value, parser_data);
          }
          return a_parameter_value;
        });
      }
    });

    return parameters;

  }

  deployClusterInstances(parameters){

    du.debug('Deploy Cluster Instances');

    let instances = parameters.Instances;

    let instance_deployment_promises = arrayutilities.map(instances, instance => {

      let instance_parameters = this.parseParameters(instance);

      return this.rdsutilities.putDBInstance(instance_parameters);

    });

    return Promise.all(instance_deployment_promises).then((instance_deployment_promises) => {

      return instance_deployment_promises;

    });

  }

}

module.exports = new RDSClusterDeployment();
