const _ = require('lodash');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib','parser-utilities.js');

const AccountController = global.SixCRM.routes.include('entities', 'Account.js');

module.exports = class TermsAndConditions {

	async getLatestTermsAndConditions(role) {

		du.debug('Get Latest Terms And Conditions');

		role = (!_.isUndefined(role) && !_.isNull(role))?role:'user';
		let directory = (role == 'user')?role:'user_acl/'+role;

		const terms_and_conditions_meta = global.SixCRM.routes.include('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.json');
		const terms_and_conditions_document = await this.acquireDocument(directory);

		const terms_and_conditions = {
			title: terms_and_conditions_meta.title,
			body: terms_and_conditions_document,
			version: terms_and_conditions_meta.version
		};

		mvu.validateModel(terms_and_conditions, global.SixCRM.routes.path('model','helpers/termsandconditions/termsandconditions.json'));

		return terms_and_conditions;

	}

	async acquireDocument(directory){

		du.debug('Acquire Document');

		let tokenized_document = await fileutilities.getFileContents(global.SixCRM.routes.path('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.md'));

		let tokens = await this.getTokenValues();

		return parserutilities.parse(tokenized_document, tokens);

	}

	async getTokenValues(){

		du.debug('Get Token Values');

		let tokens = {};

		if(_.has(global, 'account')){

			let accountController = new AccountController();

			accountController.disableACLs();
			let account = await accountController.get({id: global.account});
			accountController.enableACLs();

			if(!_.isNull(account)){

				tokens.account = account;

			}

		}

		return tokens;

	}

}
