'use strict'
const _ = require('underscore');

require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const AWS = require("aws-sdk");


//Technical Debt: need to introduce parameter class to simplify this

class DMSDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		let params = { apiVersion: '2016-01-01' }

		this.endpoint_id_template = 'sixcrm-{{stage}}-{{endpoint_id}}';
		this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');
		this.iamutilities = global.SixCRM.routes.include('lib', 'iam-utilities.js');

		this.dms = new AWS.DMS(params);
	}

	executeMigration() {

		du.debug('Execute Migration');

		return this.getEndpointPairs()
			.then(endpoint_pairs => this.createEndpoints({ endpoint_pairs: endpoint_pairs }))


	}

	getEndpointPairs() {

		du.debug('Get Endpoint Pairs')

		let endpoint_pairs = global.SixCRM.routes.include('deployment', 'dms/configuration/endpoints.json');

		if (!_.isArray(endpoint_pairs)) { eu.throwError('server', 'DMSDeployment.getEndpointData assumes that the JSON files are arrays.'); }

		return Promise.resolve(endpoint_pairs);

	}

	createEndpoints({ endpoint_pairs }) {

		du.debug('Create Endpoints');

		let endpoint_promises = [];

		endpoint_pairs.map(endpoint_pair => {

			//Technical Debt: This is ugly validation
			if (!objectutilities.has(endpoint_pair, 'target') || !objectutilities.has(endpoint_pair, 'source')) {

				eu.throwError('server', 'DMSDeployment.createEndpoints assumes that the endpoint pair object has a target and a source.');

			}

			objectutilities.map(endpoint_pair, key => {

				var endpoint_id = this.createEnvironmentSpecificEndpointName(endpoint_pair[key].id)

				endpoint_promises.push(this.assureEndpoint({ endpoint_id: endpoint_id, endpoint_type: endpoint_pair[key].type, engine_name: endpoint_pair[key].engine }))

			})

		});

		return Promise.all(endpoint_promises).then(() => {

			return 'Complete';

		});

	}

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

			this.dms.createEndpoint(parameters, function (err, data) {

				if (err) {
					du.warning('error', err.stack);
					return false;
				} else {

					du.warning('created endpoint data', data);

					return data;

				}        // successful response

			});

		});
	}

	getDynamoRole() {

		du.debug('Get Autoscaling Role');

		let role_definition = global.SixCRM.routes.include('deployment', 'dynamodb/configuration/autoscalingrole.json');

		return this.iamutilities.roleExists(role_definition).then(result => {

			if (result == false) {
				eu.throwError('server', 'Role does not exist: ' + role_definition.RoleName);
			}

			return result;

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

			//Technical Debt: this currently only supports dynamo and postgres
			case 'dynamodb': {

				return this.getDynamoRole()
					.then(dynamo_role => {

						du.warning(dynamo_role);

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

	createEnvironmentSpecificEndpointName(endpoint_id) {

		du.debug('Create Environment Specific Endpoint Name');

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


				du.warning(error);
				du.warning(data);


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
