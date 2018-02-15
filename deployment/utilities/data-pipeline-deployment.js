'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class DataPipelineDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');
		this.s3deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');
		this.datapipelineutilities = global.SixCRM.routes.include('lib', 'data-pipeline-utilities.js');

	}

	assurePipeline() {

		du.debug('Execute Data Pipeline Deployment');

		return this.assureSeeds();

	}

	assureSeedFile(seed_file_name) {

		du.debug('Assure Seed File')

		let parameters = {
			Bucket: this.data_pipeline_bucket,
			Key: `seeds/${seed_file_name}`
		}

		du.warning(parameters);

		return this.s3utilities.objectExists(parameters).then(result => {

			if (result) {

				return result;

			} else {

				let filepath = './deployment/datapipeline/configuration/seeds';

				return fileutilities.getFileContents(`${filepath}/${seed_file_name}`).then(file_data => {

					parameters.body = file_data;

					return this.s3utilities.putObject({Bucket: this.data_pipeline_bucket, Key: `seeds/${seed_file_name}`, Body: file_data}).then(result => {

						du.warning(result);
						return result;

					});
				})




			}

		})

	}


	assureSeeds() {

		du.debug('Assure Seeds');

		let bucket = 'data-pipeline';
		this.data_pipeline_bucket = this.s3deployment.createEnvironmentSpecificBucketName(bucket);
		let additional_params = { Prefix: 'seeds' }



		//Technical Debt: could use some better validation thatj ust verifiying if the seeds folder has items
		return this.s3utilities.assureBucket({ Bucket: this.data_pipeline_bucket }) //Does the bucket exist?
			.then(() => this.s3utilities.listObjects(this.data_pipeline_bucket, null, additional_params)
				.then(result => {

					du.warning(result);

					//Techincal Debt: should be zero, listobjects is returning a random object
					if (result >= 1) { //Does the bucket have seeds?

						return true;

					} else {

						let seed_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 'datapipeline/configuration/seeds'));

						let seed_promises = [];

						seed_files.forEach(seed_file => {
							seed_promises.push(this.assureSeedFile(seed_file));
						});

						return Promise.all(seed_promises).then(() => {

							return 'Complete';

						});

					}

				})
			);

	};

}



module.exports = new DataPipelineDeployment();
