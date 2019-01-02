
const imagetype = require('image-type');
const isSvg = require('is-svg');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

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
			if (isSvg(image_data)) {
				return {
					ext: 'svg',
					mime: 'image/svg+xml'
				}
			}

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
