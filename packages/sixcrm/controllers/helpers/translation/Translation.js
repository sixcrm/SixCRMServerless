const translation = require('sixcrm-translations');
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;


module.exports = class TranslationHelperController {

	constructor(){}

	getTranslationFile(language_preference){
		return translation(language_preference);

	}

	getTranslationObject(language_preference, path, fatal){
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
