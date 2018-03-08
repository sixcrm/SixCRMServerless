'use strict';

const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

class RDSClusterDeployment {

  constructor() {

    this._rdsutilities = global.SixCRM.routes.include('lib', 'rds-utilities.js');

  }

  deploy() {

    du.debug('Deploy Cluster');

    return this._getParameterConfigurationFromFile()
      .then((parameters) => this._parseParameters(parameters))
      .then((parameters) => {
        return this._rdsutilities.putCluster(parameters).then(data => {

          du.info(data);

          if (!objectutilities.hasRecursive(data, 'DBClusters.0.Endpoint')) {

            eu.throwError('server', 'Data object does not contain appropriate key: Clusters.0.Endpoint.Address');

          }

          global.SixCRM.configuration.setEnvironmentConfig('aurora.host', data.DBClusters[0].Endpoint);

          du.info('Aurora host resolved', global.SixCRM.configuration.site_config.aurora);

          return parameters;

        });
      })
      .then((parameters) => this._deployClusterInstances(parameters))
      .then(() => {
        return 'Complete';
      });

  }

  _getParameterConfigurationFromFile() {

    du.debug('Get Parameter Configuration From File.');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'rds/clusters/')).then(directory_files => {

      let dpcf = arrayutilities.find(directory_files, (directory_file) => {
        return (directory_file == global.SixCRM.configuration.stage + '.json');
      });

      dpcf = (_.isUndefined(dpcf) || _.isNull(dpcf)) ? 'default.json' : dpcf;

      return global.SixCRM.routes.include('deployment', 'rds/clusters/' + dpcf);

    });

  }

  _parseParameters(parameters) {

    du.debug('Parse Parameters');

    let parser_data = {
      region: this._rdsutilities.getRegion(),
      stage: global.SixCRM.configuration.stage,
      account: global.SixCRM.configuration.site_config.aws.account
    };

    objectutilities.map(parameters, key => {
      if (_.isString(parameters[key])) {
        parameters[key] = parserutilities.parse(parameters[key], parser_data);
      }
      if (_.isArray(parameters[key]) && arrayutilities.nonEmpty(parameters[key])) {
        parameters[key] = arrayutilities.map(parameters[key], a_parameter_value => {
          if (_.isString(a_parameter_value)) {
            return parserutilities.parse(a_parameter_value, parser_data);
          }
          return a_parameter_value;
        });
      }
    });

    return parameters;

  }

  _deployClusterInstances(parameters) {

    du.debug('Deploy Cluster Instances');

    let instances = parameters.Instances;

    let instance_deployment_promises = arrayutilities.map(instances, instance => {

      let instance_parameters = this._parseParameters(instance);

      return this._rdsutilities.putDBInstance(instance_parameters);

    });

    return Promise.all(instance_deployment_promises).then((instance_deployment_promises) => {

      return instance_deployment_promises;

    });

  }

}

module.exports = new RDSClusterDeployment();
