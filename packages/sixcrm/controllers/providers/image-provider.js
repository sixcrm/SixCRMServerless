
const imagetype = require('image-type');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

module.exports = class ImageProvider {

	constructor(){

	}


	getImageMetadata(image_data){
		let image_metadata;

		try{
			image_metadata = imagetype(image_data);
		}catch(error){
			du.error(error);
			throw eu.getError('server', 'Unable to identify image metadata.');
		}

		if (!image_metadata) {
			const message = 'Unsupported file type.';
			du.warning(message);
			throw eu.getError('server', message);
		}

		return image_metadata;

	}

	getImageMimeType(image_data){
		return this.getImageMetadata(image_data).mime;

	}

	getImageExtension(image_data){
		return this.getImageMetadata(image_data).ext;

	}

}
