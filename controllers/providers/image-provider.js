
const imagetype = require('image-type');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

module.exports = class ImageProvider {

	constructor(){

	}


	getImageMetadata(image_data){

		du.debug('Get Image Metadata');

		let image_metadata;

		try{
			image_metadata = imagetype(image_data);
		}catch(error){
			du.error(error);
			throw eu.getError('server', 'Unable to identify image metadata.');
		}

		return image_metadata;

	}

	getImageMimeType(image_data){

		du.debug('Get Image Mime Type');

		return this.getImageMetadata(image_data).mime;

	}

	getImageExtension(image_data){

		du.debug('Get Image Extension');

		return this.getImageMetadata(image_data).ext;

	}

}
