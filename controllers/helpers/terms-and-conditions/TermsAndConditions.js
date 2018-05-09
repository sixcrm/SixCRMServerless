
const _ = require('lodash');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class TermsAndConditions {

	async getLatestTermsAndConditions(role) {

		du.debug('Get Latest Terms And Conditions');

		role = (!_.isUndefined(role) && !_.isNull(role))?role:'user';
		let directory = (role == 'user')?role:'user_acl/'+role;

		const terms_and_conditions_meta = global.SixCRM.routes.include('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.json');
		const terms_and_conditions_document = await fileutilities.getFileContents(global.SixCRM.routes.path('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.md'));

		const terms_and_conditions = {
			title: terms_and_conditions_meta.title,
			body: terms_and_conditions_document,
			version: terms_and_conditions_meta.version
		};

		mvu.validateModel(terms_and_conditions, global.SixCRM.routes.path('model','helpers/termsandconditions/termsandconditions.json'));

		return terms_and_conditions;

	}

}
