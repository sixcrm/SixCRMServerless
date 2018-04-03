const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

module.exports = class AuroraClusterDeployment {

	constructor() {

		this._rdsUtilities = global.SixCRM.routes.include('lib', 'providers/rds-provider.js');

	}

	deploy() {

		du.debug('Deploy Cluster');

		const parameters = {
			DBClusterIdentifier: 'sixcrm' // Technical Debt: This should not be assumed. Read from config instead.
		};

		return this._rdsUtilities.describeClusters(parameters)
			.then((data) => {

				if (data.DBClusters.length) {

					du.info('Aurora cluster already created');

					return Promise.resolve();

				} else {

					du.info('Creating Aurora cluster');

					return Promise.resolve()
						.then(this._getParameterConfigurationFromFile.bind(this))
						.then(this._parseParameters.bind(this))
						.then((parameters) => {

							parameters['MasterUsername'] = global.SixCRM.configuration.site_config.aurora.user;
							parameters['MasterUserPassword'] = global.SixCRM.configuration.site_config.aurora.password;

							return this._rdsUtilities.putCluster(parameters).then(data => {

								du.info(data);

								if (data.DBClusters) {

									if (!objectutilities.hasRecursive(data, 'DBClusters.0.Endpoint')) {

										eu.throwError('server', 'Data object does not contain appropriate key: DBClusters.0.Endpoint');

									}

									global.SixCRM.configuration.setEnvironmentConfig('aurora.host', data.DBClusters[0].Endpoint);

								} else {

									if (!objectutilities.hasRecursive(data, 'DBCluster.Endpoint')) {

										eu.throwError('server', 'Data object does not contain appropriate key: DBCluster.Endpoint');

									}

									global.SixCRM.configuration.setEnvironmentConfig('aurora.host', data.DBCluster.Endpoint);

								}

								du.info('Aurora host resolved', global.SixCRM.configuration.site_config.aurora);

								return parameters;

							});
						})
						.then((parameters) => this._deployClusterInstances(parameters));

				}

			});

	}

	_getParameterConfigurationFromFile() {

		du.debug('Get Parameter Configuration From File.');

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'aurora/config/')).then(directory_files => {

			let dpcf = arrayutilities.find(directory_files, (directory_file) => {

				return (directory_file == global.SixCRM.configuration.stage + '.json');

			});

			dpcf = (_.isUndefined(dpcf) || _.isNull(dpcf)) ? 'default.json' : dpcf;

			return global.SixCRM.routes.include('deployment', 'aurora/config/' + dpcf);

		});

	}

	_parseParameters(parameters) {

		du.debug('Parse Parameters');

		const parserData = {
			region: this._rdsUtilities.getRegion(),
			stage: global.SixCRM.configuration.stage,
			account: global.SixCRM.configuration.site_config.aws.account
		};

		objectutilities.map(parameters, key => {

			if (_.isString(parameters[key])) {

				parameters[key] = parserutilities.parse(parameters[key], parserData);

			}

			if (_.isArray(parameters[key]) && arrayutilities.nonEmpty(parameters[key])) {

				parameters[key] = arrayutilities.map(parameters[key], parameterValue => {

					if (_.isString(parameterValue)) {

						return parserutilities.parse(parameterValue, parserData);

					}

					return parameterValue;

				});

			}

		});

		return parameters;

	}

	_deployClusterInstances(parameters) {

		du.debug('Deploy Cluster Instances');

		const instances = parameters.Instances;

		const instanceDeploymentPromises = arrayutilities.map(instances, instance => {

			const instanceParameters = this._parseParameters(instance);

			return this._rdsUtilities.putDBInstance(instanceParameters);

		});

		return Promise.all(instanceDeploymentPromises);

	}

}