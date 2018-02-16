'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class DataPipelineDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');
		this.s3deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');
		this.datapipelineutilities = global.SixCRM.routes.include('lib', 'data-pipeline-utilities.js');
		this.unique_id = `sixcrm-${process.env.stage}-seed-dynamodb`;
	}

	execute() {

		du.debug('Execute Deploy Data Pipeline');

		return this.assureSeeds()
			.then(() => this.assurePipeline())
			.catch(error => eu.throwError('server', error));


	}

	assurePipeline() {

		du.debug('Assure Pipeline');

			let create_parameters = {
				name: 'Seed Dynamo Pipeline', /* required */
				uniqueId: `${this.unique_id}`, /* required */
				description: 'Seeds Dynamo Table'
			};


			return this.datapipelineutilities.createPipeline({ parameters: create_parameters })
				.then(result => this.buildPipelineDefinitionParams({pipeline_id: result.pipelineId}))
				.then(definition => this.datapipelineutilities.validatePipelineDefinition({parameters: definition}))
				.then(definition => this.datapipelineutilities.putPipelineDefinition({parameters: definition}))
				.then(definition => this.datapipelineutilities.activatePipeline({parameters: {pipelineId: definition.pipelineId}}))
				.catch(error => eu.throwError('server', error.message));

	}

	buildPipelineDefinitionParams({pipeline_id}) {

		du.debug('Build Pipeline Definition Parameters')

		let definition_path = global.SixCRM.routes.path('deployment', `datapipeline/configuration/definitions/${process.env.stage}/definition.json`);
		let pipeline_definition = JSON.parse(fileutilities.getFileContentsSync(definition_path));

		pipeline_definition.pipelineId = pipeline_id;

		du.warning(pipeline_definition);

		return Promise.resolve(pipeline_definition)

	}

	assureSeedFile(seed_file_name) {

		du.debug('Assure Seed File')

		let parameters = {
			Bucket: this.data_pipeline_bucket,
			Key: `seeds/${seed_file_name}`
		}

		//Does the seed file already exist?
		return this.s3utilities.objectExists(parameters).then(result => {

			if (result) {
				//Yes, return true
				return result;

			} else {
				//No, Add seed file to s3 bucket

				let filepath = './deployment/datapipeline/configuration/seeds';

				return fileutilities.getFileContents(`${filepath}/${seed_file_name}`).then(file_data => {

					parameters.body = file_data;

					return this.s3utilities.putObject({ Bucket: this.data_pipeline_bucket, Key: `seeds/${seed_file_name}`, Body: file_data }).then(result => {

						du.warning(result);
						return result;

					});

				});

			}

		})

	}

	assureSeeds() {

		du.debug('Assure Seeds');
		let seed_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 'datapipeline/configuration/seeds'));
		let bucket = 'data-pipeline';
		let additional_params = { Prefix: 'seeds' }

		//assure enviornment specific data pipeline bucket (IE: sixcrm-development-etc)
		this.data_pipeline_bucket = this.s3deployment.createEnvironmentSpecificBucketName(bucket);

		//Technical Debt: could use some better validation thatj ust verifiying if the seeds folder has items
		return this.s3utilities.assureBucket({ Bucket: this.data_pipeline_bucket }) //Does the bucket exist?
			.then(() => this.s3utilities.listObjects(this.data_pipeline_bucket, null, additional_params)
				.then(result => {

					//Do the correct number of seeds exist?
					if (result === seed_files.length) {

						//Yes, continue
						return true;

					} else {

						//No, populate assure seed array
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
