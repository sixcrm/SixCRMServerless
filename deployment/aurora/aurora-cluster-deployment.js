const _ = require('lodash');
const BBPromise = require('bluebird');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');

module.exports = class AuroraClusterDeployment {

	constructor() {

		this._rdsprovider = new RDSProvider();

	}

	async deploy() {

		du.debug('Deploy Cluster');

		const describeClustersResponse = await this._rdsprovider.describeClusters({
			DBClusterIdentifier: 'sixcrm' // Technical Debt: This should not be assumed. Read from config instead.
		});

		if (describeClustersResponse.DBClusters.length) {

			du.info('Aurora cluster already created');

			return;

		}

		du.info('Creating Aurora cluster');

		const parametersFromFile = await this._getParameterConfigurationFromFile();
		const parameters = await this._parseParameters(parametersFromFile);

		parameters['MasterUsername'] = global.SixCRM.configuration.site_config.aurora.user;
		parameters['MasterUserPassword'] = global.SixCRM.configuration.site_config.aurora.password;

		const securityGroups = await this._getSecurityGroupIds(parameters.VpcSecurityGroupIds);
		parameters.VpcSecurityGroupIds = securityGroups;

		const putClusterResponse = await this._rdsprovider.putCluster(parameters);

		du.info(putClusterResponse);

		if (putClusterResponse.DBClusters) {

			if (!objectutilities.hasRecursive(putClusterResponse, 'DBClusters.0.Endpoint')) {

				throw eu.getError('server', 'Data object does not contain appropriate key: DBClusters.0.Endpoint');

			}

			//global.SixCRM.configuration.setEnvironmentConfig('aurora.host', data.DBClusters[0].Endpoint);

		} else {

			if (!objectutilities.hasRecursive(putClusterResponse, 'DBCluster.Endpoint')) {

				throw eu.getError('server', 'Data object does not contain appropriate key: DBCluster.Endpoint');

			}

			//global.SixCRM.configuration.setEnvironmentConfig('aurora.host', data.DBCluster.Endpoint);

		}

		du.info('Aurora host resolved', global.SixCRM.configuration.site_config.aurora);

		await this._deployClusterInstances(parameters)

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
			region: this._rdsprovider.getRegion(),
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

	async _deployClusterInstances(parameters) {

		du.debug('Deploy Cluster Instances');

		const instances = parameters.Instances;

		const instanceDeploymentPromises = arrayutilities.map(instances, instance => {

			const instanceParameters = this._parseParameters(instance);

			return this._rdsprovider.putDBInstance(instanceParameters);

		});

		await Promise.all(instanceDeploymentPromises);

		await this._rdsprovider.waitFor('dBInstanceAvailable', {
			Filters: [{
				Name: 'db-cluster-id',
				Values: [parameters.DBClusterIdentifier]
			}]
		});


	}

	async _getSecurityGroupIds(groupNames) {

		if (!_.has(this, 'ec2provider')) {

			const EC2Provider = global.SixCRM.routes.include('controllers', 'providers/ec2-provider.js');
			this.ec2provider = new EC2Provider();

		}

		return BBPromise.map(groupNames, async (groupName) => {

			const securityGroup = await this.ec2provider.securityGroupExists({
				GroupName: groupName
			});

			return securityGroup.GroupId;

		});

	}

}
