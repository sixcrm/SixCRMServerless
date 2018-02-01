'use strict'
const _ = require('underscore');
const imagetype = require('image-type');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

class ImageUtilities {

  constructor(){

  }


  getImageMetadata(image_data){

    du.debug('Get Image Metadata');

    let image_metadata;

    try{
      image_metadata = imagetype(image_data);
    }catch(error){
      du.error(error);
      eu.throwError('server', 'Unable to identify image metadata.');
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

module.exports = new ImageUtilities();
