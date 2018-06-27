const translation = require('sixcrm-translations');
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;


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
			throw eu.getError('server', 'No translation at path "'+path+'" in '+language_preference+' translation file.');
		}

		return null;

	}

}
