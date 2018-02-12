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

class DMSDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		let params = { apiVersion: '2016-01-01' }

		this.endpoint_id_template = 'sixcrm-{{stage}}-{{endpoint_id}}';

		this.dms = new AWS.DMS(params);
	}

	executeMigration() {

		return this.getEndpointIds()
			.then(endpoint_ids => this.createEndpoints({ endpoint_ids: endpoint_ids }))


	}

	getEndpointIds() {

		'Get Endpoint Ids'

		let endpoints = global.SixCRM.routes.include('deployment', 'dms/configuration/endpoints.json');

		if (!_.isArray(endpoints)) { eu.throwError('server', 'DMSDeployment.getEndpointData assumes that the JSON files are arrays.'); }

		return Promise.resolve(endpoints);

	}

	createEndpoints({ endpoint_ids }) {

		du.debug('Create Endpoints');

		let endpoint_promises = [];

		endpoint_ids.map(subdefinition => {

			let endpoint_id = this.createEnvironmentSpecificEndpointName(subdefinition.id)

			endpoint_promises.push(this.assureEndpoint({ endpoint_id: endpoint_id, type: subdefinition.type }))

		});

		return Promise.all(endpoint_promises).then(() => {

			return 'Complete';

		});
	}

	assureEndpoint({ endpoint_id, type }) {

		du.debug('Assure Endpoint');

		return new Promise((resolve, reject) => {

			this.describeEndpoint({ id: endpoint_id, type: type })
				.then(result => {

					if (!result) {

						du.output(endpoint_id + ' endpoint not found, creating');


						return resolve(true);

					} else {

						du.output(endpoint_id + ' endpoint found, skipping');

						return resolve(true);

					}


				}).catch((error) => {

					du.warning('DMS error (describeEndpoint bucket): ', error);

					return reject(error);

				});


		});

	}

	createEnvironmentSpecificEndpointName(endpoint_id) {

		du.debug('Create Environment Specific Endpoint Name');

		return parserutilities.parse(this.endpoint_id_template, { stage: process.env.stage, endpoint_id: endpoint_id });

	}

	describeEndpoint({ id, type,  }) {

		du.debug('Describe Endpoint');

		var parameters = {
			Filters: [
				{
					Name: 'endpoint-id',
					Values: [ `${id}` ]
				},
				{
					Name: 'endpoint-type',
					Values: [ `${type}` ]
				},
			],
		};


		return new Promise((resolve, reject) => {

			this.dms.describeEndpoints(parameters, (error, data) => {
				if (error){


					//Technical Debt: This is ugly, assumes if there's an error that the endpoints don't exist. Need to find a way to verify endpoint existence without this call, possibly with tag creation / list tags
					du.info(parameters);
					return resolve(false);

				} else {

					return resolve(data);

				}
			});

		});


	}



	// createEndpoint(params) {

	// 	this.dms.createEndpoint(params, function (err, data) {
	// 		if (err) console.log(err, err.stack); // an error occurred
	// 		Promise.resolve(data);         // successful response
	// 		/*
	// 		data = {
	// 		 Endpoint: {
	// 			EndpointArn: "arn:aws:dms:us-east-1:123456789012:endpoint:RAAR3R22XSH46S3PWLC3NJAWKM",
	// 			EndpointIdentifier: "test-endpoint-1",
	// 			EndpointType: "source",
	// 			EngineName: "mysql",
	// 			KmsKeyId: "arn:aws:kms:us-east-1:123456789012:key/4c1731d6-5435-ed4d-be13-d53411a7cfbd",
	// 			Port: 3306,
	// 			ServerName: "mydb.cx1llnox7iyx.us-west-2.rds.amazonaws.com",
	// 			Status: "active",
	// 			Username: "username"
	// 		 }
	// 		}
	// 		*/
	// 	});
	// }

}

module.exports = new DMSDeployment();
