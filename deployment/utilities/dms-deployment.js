'use strict'
const _ = require('underscore');

require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const AWS = require("aws-sdk");

//Technical Debt: need to introduce parameter class to simplify this
class DMSDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		let params = { apiVersion: '2016-01-01' }

		this.endpoint_id_template = 'sixcrm-{{stage}}-{{endpoint_id}}';
		this.replication_instance_id_template = 'sixcrm-{{stage}}-replication-instance';
		this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');
		this.iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

		this.parameter_validation = {
			'dynamodbrole': global.SixCRM.routes.path('model', 'deployment/dms/role.json'),
			'endpointpair': global.SixCRM.routes.path('model', 'deployment/dms/endpointpair.json'),
		};

		this.parameter_definition = {};
		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({ validation: this.parameter_validation, definition: this.parameter_definition });


		this.dms = new AWS.DMS(params);
	}

	executeMigration() {

		du.debug('Execute Migration');

		return this.assureReplicationInstance()
			.then(() => this.getEndpointPair())
			.then(() => this.createEndpoints())
			.then(() => {
				return du.warning('Complete');
			})

	}

	getEndpointPair() {

		du.debug('Get Endpoint Pairs')

		let endpoint_pair = global.SixCRM.routes.include('deployment', 'dms/configuration/endpoints.json');

		if (!_.isObject(endpoint_pair)) { eu.throwError('server', 'DMSDeployment.getendpointpair assumes that the JSON is an object.'); }

		this.parameters.set('endpointpair', endpoint_pair);

		return Promise.resolve(true);

	}

	createEndpoints() {

		du.debug('Create Endpoints');

		let endpoint_promises = [];

		let endpoint_pair = this.parameters.get('endpointpair');

		objectutilities.map(endpoint_pair, key => {

			var endpoint_id = this.createEnvironmentSpecificEndpointId(endpoint_pair[key].id)

			endpoint_promises.push(this.assureEndpoint({ endpoint_id: endpoint_id, endpoint_type: endpoint_pair[key].type, engine_name: endpoint_pair[key].engine }))

		})

		return Promise.all(endpoint_promises).then(() => {

			return 'Complete';

		});

	}

	//Technical Debt: gross.
	assureEndpoint({ endpoint_id, endpoint_type, engine_name }) {

		du.debug('Assure Endpoint');

		return new Promise((resolve, reject) => {

			//Does endpoint exist?
			this.describeEndpoint({ id: endpoint_id, type: endpoint_type })
				.then(result => {

					//If not...
					if (!result) {

						du.output(endpoint_id + ' endpoint not found, creating');

						//Build endpoint params + create endpoint
						return this.buildEndpointParameters({ endpoint_id, endpoint_type, engine_name })
							.then(parameters => this.createEndpoint({ parameters: parameters }));

					} else {

						du.output(endpoint_id + ' endpoint found, skipping');

						return resolve(true);

					}

				}).catch((error) => {

					du.warning('DMS error (describeEndpoint): ', error);

					return reject(error);

				});

		});

	}

	createEndpoint({ parameters }) {

		du.debug('Create Endpoint');

		return new Promise((resolve, reject) => {

			du.warning(parameters);

			this.dms.createEndpoint(parameters, (err, data) => {
				//Technical Debt: need better error handling here
				if (err) {
					du.warning('error', err.stack);
					return false;
				} else {

					du.warning('created endpoint data', data);

					return data;

				}

			});

		});
	}

	assureReplicationInstance() {

		var instance_id = this.createEnvironmentSpecificInstanceId(this.replication_instance_id_template);

		du.warning(instance_id);

		//Does replication instance exist?
		return this.describeReplicationInstance({ replication_instance_id: instance_id })
			.then(result => {
				//if it doesnt..
				if (!result) {

					du.output(instance_id + ' instance not found, creating');

					//create instance
					return this.createReplicationInstsance({ replication_instance_id: instance_id });

				} else {
					//if it does...
					du.output(instance_id + ' instance found, skipping');
					//continue
					return Promise.resolve(true);
				}

			});

	}

	describeReplicationInstance({ replication_instance_id }) {

		du.debug('Describe Replication Instance');

		return new Promise((resolve, reject) => {

			let parameters = {
				Filters: [
					{
						Name: 'replication-instance-id',
						Values: [`${replication_instance_id}`]
					}
				]
			};

			this.dms.describeReplicationInstances(parameters, (error, data) => {

				if (error) {

					//Technical Debt: This is ugly, assumes if there's an error that the endpoints don't exist. Need to find a way to verify endpoint existence without this call, possibly with tag creation / list tags
					du.info(parameters);
					du.warning(error);
					return resolve(false);

				} else {

					du.warning(data);
					this.replication_instance_arn = data.ReplicationInstance.ReplicationInstanceArn;

					return resolve(data);

				}

			});

		});

	}

	createReplicationInstsance({ replication_instance_id }) {

		du.warning('getting here');

		return new Promise((resolve, reject) => {
			let parameters = {
				ReplicationInstanceClass: 'dms.t2.small', /* required */
				ReplicationInstanceIdentifier: `${replication_instance_id}`, /* required */
			}

			this.dms.createReplicationInstance(parameters, (error, data) => {
				if (error) {
					du.error(error);
					eu.throwError('server', error)
				} else {

					du.warning('created replication instance data', data);

					//technical debt: move this to parameters
					this.replication_instance_arn = data.ReplicationInstance.ReplicationInstanceArn;

					return resolve(data);
				}

			});

		});

	}

	getDynamoRole() {

		du.debug('Get Autoscaling Role');

		let role_definition = global.SixCRM.routes.include('deployment', 'iam/roles/dynamodb_dms.json');

		return this.iamutilities.roleExists({ RoleName: role_definition[0].RoleName }).then(role => {

			if (role == false) {
				eu.throwError('server', 'Role does not exist: ' + role_definition.RoleName);
			}

			this.parameters.set('dynamodbrole', role)

			return true;

		});

	}

	buildEndpointParameters({ endpoint_id, endpoint_type, engine_name }) {

		du.debug('Build Endpoint Parameters');

		var parameters = {
			EndpointIdentifier: `${endpoint_id}`, /* required */
			EndpointType: `${endpoint_type}`, /* required */
			EngineName: `${engine_name}`,

		}

		switch (engine_name) {

			//Technical Debt: this currently only supports dynamo and postgres endpoint engines
			case 'dynamodb': {

				return this.getDynamoRole().then(() => {

					let dynamo_role = this.parameters.get('dynamodbrole');

					parameters.DynamoDbSettings = {};
					parameters.DynamoDbSettings.ServiceAccessRoleArn = dynamo_role.Role.Arn;
					return parameters;

				});

			}

			case 'postgres': {

				return this.redshiftqueryutilities.getHost().then(host => {

					parameters.ServerName = host;
					parameters.Username = global.SixCRM.configuration.site_config.redshift.user;
					parameters.Password = global.SixCRM.configuration.site_config.redshift.password;
					parameters.Port = global.SixCRM.configuration.site_config.redshift.port;
					parameters.DatabaseName = global.SixCRM.configuration.site_config.redshift.database;
					return parameters;

				});

			}

			default: return eu.throwError('server', 'Invalid Endpoint Engine Type during DMS migration');

		}

	}

	createEnvironmentSpecificInstanceId() {

		du.debug('Create Environment Specific Endpoint Name');

		return parserutilities.parse(this.replication_instance_id_template, { stage: process.env.stage });

	}

	createEnvironmentSpecificEndpointId(endpoint_id) {

		du.debug('Create Environment Specific Endpoint Id');

		return parserutilities.parse(this.endpoint_id_template, { stage: process.env.stage, endpoint_id: endpoint_id });

	}

	describeEndpoint({ id, type }) {

		du.debug('Describe Endpoint');

		return new Promise((resolve, reject) => {

			var parameters = {
				Filters: [
					{
						Name: 'endpoint-id',
						Values: [`${id}`]
					},
					{
						Name: 'endpoint-type',
						Values: [`${type}`]
					},
				],
			};

			this.dms.describeEndpoints(parameters, (error, data) => {

				if (error) {

					//Technical Debt: This is ugly, assumes if there's an error that the endpoints don't exist. Need to find a way to verify endpoint existence without this call, possibly with tag creation / list tags
					du.info(parameters);
					return resolve(false);

				} else {

					return resolve(data);

				}

			});

		});

	}

}

module.exports = new DMSDeployment();
