const translation = require('sixcrm-translations');
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');


module.exports = class TranslationHelperController {

  constructor(){}

  getTranslationFile(language_preference){

    du.debug('Get Translation File');

    return translation(language_preference);

  }

  getTranslationObject(language_preference, path, fatal){

    du.debug('Get Translation Object');

    fatal = (_.isUndefined(fatal) || _.isNull(fatal))?false:fatal;

    let translation_file = this.getTranslationFile(language_preference);

    if(objectutilities.hasRecursive(translation_file, path)){
      return objectutilities.getRecursive(translation_file, path);
    }

    if(fatal){
      eu.throwError('server', 'No translation at path "'+path+'" in '+language_preference+' translation file.');
    }

    return null;

  }

}
