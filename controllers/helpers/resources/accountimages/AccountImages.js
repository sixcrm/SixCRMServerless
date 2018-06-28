
const _ = require('lodash');

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const s3provider = new S3Provider();
const ImageProvider = global.SixCRM.routes.include('controllers','providers/image-provider.js');
const imageprovider = new ImageProvider();
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const hashutilities = require('@6crm/sixcrmcore/util/hash-utilities').default;

const ResourcesController = global.SixCRM.routes.include('helpers', 'resources/Resources.js');

module.exports = class AccountImages extends ResourcesController {

	constructor() {

		super();

		this.parameter_validation = {
			'base64imagedata': global.SixCRM.routes.path('model','definitions/base64string.json')
		};

		this.parameter_definition = {
			upload:{
				required:{
					base64imagedata: 'data'
				},
				optional:{}
			}
		};

		this.augmentParameters();

	}

	upload() {

		du.debug('Upload');
		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'upload'}))
			.then(() => this.uploadImageToS3())

	}

	convertImageDataToBase64(image_data){

		du.info('Convert Image Data to Base64');

		return hashutilities.toBase64(image_data);

	}

	getAccountResourcesBucketName(){

		du.debug('Get Account Uploads Bucket');

		return arrayutilities.compress(['sixcrm', global.SixCRM.configuration.stage, global.SixCRM.configuration.site_config.s3.account_resources_bucket],'-','');

	}

	getAccountImageUploadPrefix(){

		du.debug('Get Account Image Upload Prefix');

		let prefix = [
			global.account,
			'user',
			'images'
		];

		return arrayutilities.compress(prefix, '/', '');

	}

	createImageFilename(base64_image, image_data){

		du.debug('Create Image Filename');

		let sha1 = hashutilities.toSHA1(base64_image);

		let extension = imageprovider.getImageExtension(image_data);

		return arrayutilities.compress([sha1, extension],'.','');

	}

	convertImageDataToBinary(base64_image_data){

		du.debug('Convert Image Data To Binary');

		return Buffer.from(base64_image_data, 'base64')

	}

	uploadImageToS3(){

		let base64_image_data = this.parameters.get('base64imagedata');

		let image_data = this.convertImageDataToBinary(base64_image_data);
		let bucket = this.getAccountResourcesBucketName();
		let prefix = this.getAccountImageUploadPrefix();
		let filename = this.createImageFilename(base64_image_data, image_data);
		let content_type = imageprovider.getImageMimeType(image_data);

		let location = arrayutilities.compress(['https://s3.amazonaws.com', bucket, prefix, filename], '/', '');

		let parameters = {
			Bucket: bucket,
			Key: prefix+'/'+filename,
			Body: image_data,
			ContentType: content_type
		};

		return s3provider.putObject(parameters).then((result) => {

			if (!_.has(result, 'ETag')) {
				throw eu.getError('server', 'Unable to upload image to S3.');
			}

			return {
				filename: filename,
				path: location
			};

		});

	}

};
