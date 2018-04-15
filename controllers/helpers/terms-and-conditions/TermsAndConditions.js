
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class TermsAndConditions {

	getLatestTermsAndConditions(role) {

		du.debug('Get Latest Terms And Conditions');

		role = (!_.isUndefined(role) && !_.isNull(role))?role:'user';
		let directory = (role == 'user')?role:'user_acl/'+role;

		const terms_and_conditions = global.SixCRM.routes.include('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.json');

		mvu.validateModel(terms_and_conditions, global.SixCRM.routes.path('model','helpers/termsandconditions/termsandconditions.json'));

		return Promise.resolve(terms_and_conditions);

	}

}

