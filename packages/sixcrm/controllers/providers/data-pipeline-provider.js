
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class DataPipelineProvider extends AWSProvider {

	constructor() {
		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.AWS.config.apiVersions = { datapipeline: '2012-10-29' };
		this.datapipeline = new this.AWS.DataPipeline();

	}

	//Technical Debt: test me!
	createPipeline({ parameters }) {

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
		return new Promise((resolve) => {

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

	}

	//Technical Debt: test me!
	listPipelines() {
		return new Promise((resolve, reject) => {

			this.datapipeline.listPipelines(null, (error, data) => {

				if (error) {

					du.error(error);
					return reject(error);

				}

				return resolve(data);

			});

		});

	}

	//Technical Debt: test me!
	getPipelineDefinition({ pipeline_id }) {
		let parameters = {
			pipelineId: `${pipeline_id}`
		}


		return new Promise((resolve) => {


			this.datapipeline.getPipelineDefinition(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return resolve(false);

				}

				return resolve(data);

			});

		});

	}

	//Technical Debt: test me!
	putPipelineDefinition({ parameters }) {
		return new Promise((resolve, reject) => {

			this.datapipeline.putPipelineDefinition(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return resolve(false);

				}

				if (data.validationErrors.length > 0) {
					du.error(data);
					return reject(data.validationErrors);
				}

				return resolve(parameters);

			});

		});

	}

	validatePipelineDefinition({ parameters }) {
		return new Promise((resolve, reject) => {

			this.datapipeline.validatePipelineDefinition(parameters, (error, data) => {

				if (error) {

					du.error(error);
					return reject(error);

				}

				if (data.validationErrors.length > 0) {
					du.error(data);
					return reject(data.validationErrors);
				}

				return resolve(parameters);

			});

		});

	}

}

