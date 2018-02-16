'use strict'
const _ = require('underscore');
const AWS = require('aws-sdk');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

class DataPipelineUtilities {

	constructor() {

		AWS.config.apiVersions = { datapipeline: '2012-10-29' };
		this.datapipeline = new AWS.DataPipeline();

	}

	//Technical Debt: test me!
	createPipeline({ parameters }) {

		du.debug('Create Pipeline');

		du.warning(parameters);

		return new Promise((resolve, reject) => {

			this.datapipeline.createPipeline(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return reject(error);

				}

				return resolve(data);

			});

		})

	}

	//Technical Debt: test me!
	activatePipeline({ parameters }) {

		du.debug('Activate Pipeline');

		return new Promise((resolve, reject) => {

			this.datapipeline.activatePipeline(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return reject(error);

				}

				return resolve(data);

			});

		});

	}

	//Technical Debt: test me!
	describePipeline({ pipeline_id }) {

		du.debug('Describe Pipeline');

		return new Promise((resolve, reject) => {

			var parameters = {
				pipelineIds: [`${pipeline_id}`]
			};

			this.datapipeline.describePipelines(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return resolve(false);

				}

				return resolve(data);

			});

		});

	};

	//Technical Debt: test me!
	listPipelines() {

		du.debug('Describe Pipeline');

		return new Promise((resolve, reject) => {

			this.datapipeline.listPipelines(null, (error, data) => {

				if (error) {

					du.error(error);
					return reject(error);

				}

				return resolve(data);

			});

		});

	};

	//Technical Debt: test me!
	getPipelineDefinition({ pipeline_id }) {

		du.debug('Get Pipeline Definition');

		let parameters = {
			pipelineId: `${pipeline_id}`
		}


		return new Promise((resolve, reject) => {


			this.datapipeline.getPipelineDefinition(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return resolve(false);

				}

				return resolve(data);

			});

		});

	};

	//Technical Debt: test me!
	putPipelineDefinition({ parameters }) {

		du.debug('Put Pipeline Definition');

		return new Promise((resolve, reject) => {

			this.datapipeline.putPipelineDefinition(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return resolve(false);

				}

				if (data.validationErrors.length > 0) {
					return reject(data.validationErrors);
				}

				return resolve(parameters);

			});

		});

	};

	validatePipelineDefinition({ parameters }) {

		du.debug('Validate Pipeline Definition');


		return new Promise((resolve, reject) => {

			this.datapipeline.validatePipelineDefinition(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return reject(error);

				}

				if (data.validationErrors.length > 0) {
					return reject(data.validationErrors);
				}

				return resolve(parameters);

			});

		});

	}

}

module.exports = new DataPipelineUtilities();
