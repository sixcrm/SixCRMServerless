

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const fileutilities = require('@sixcrm/sixcrmcore/util/file-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const S3Deployment = global.SixCRM.routes.include('deployment', 'utilities/s3-deployment.js');
const DataPipelineProvider = global.SixCRM.routes.include('controllers', 'providers/data-pipeline-provider.js');
const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');

module.exports = class DataPipelineDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.s3provider = new S3Provider();
		this.s3deployment = new S3Deployment();
		this.datapipelineprovider = new DataPipelineProvider();
		this.unique_id = `sixcrm-${process.env.stage}-seed-dynamodb`;
	}

	execute() {

		du.debug('Execute Deploy Data Pipeline');

		return this.assureSeeds()
			.then(() => this.assurePipeline())
			.catch(error => { throw eu.getError('server', error) });


	}

	assurePipeline() {

		du.debug('Assure Pipeline');

		let create_parameters = {
			name: 'Seed Dynamo Pipeline', /* required */
			uniqueId: `${this.unique_id}`, /* required */
			description: 'Seeds Dynamo Table'
		};


		return this.datapipelineprovider.createPipeline({ parameters: create_parameters })
			.then(result => this.buildPipelineDefinitionParams({pipeline_id: result.pipelineId}))
			.then(definition => this.datapipelineprovider.validatePipelineDefinition({parameters: definition}))
			.then(definition => this.datapipelineprovider.putPipelineDefinition({parameters: definition}))
			.then(definition => this.datapipelineprovider.activatePipeline({parameters: {pipelineId: definition.pipelineId}}))
			.catch(error => { throw eu.getError('server', error.message) });

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
		return this.s3provider.objectExists(parameters).then(result => {

			if (result) {
				//Yes, return true
				return result;

			} else {
				//No, Add seed file to s3 bucket

				let filepath = './deployment/datapipeline/configuration/seeds';

				return fileutilities.getFileContents(`${filepath}/${seed_file_name}`).then(file_data => {

					parameters.body = file_data;

					return this.s3provider.putObject({ Bucket: this.data_pipeline_bucket, Key: `seeds/${seed_file_name}`, Body: file_data }).then(result => {

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
		return this.s3provider.assureBucket({ Bucket: this.data_pipeline_bucket }) //Does the bucket exist?
			.then(() => this.s3provider.listObjects(this.data_pipeline_bucket, null, additional_params)
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

	}

}
