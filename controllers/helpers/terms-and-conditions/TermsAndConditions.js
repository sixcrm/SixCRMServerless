const _ = require('lodash');
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;

const AccountController = global.SixCRM.routes.include('entities', 'Account.js');

module.exports = class TermsAndConditions {

	async getLatestTermsAndConditions(role, account = null) {

		du.debug('Get Latest Terms And Conditions');

		role = (!_.isUndefined(role) && !_.isNull(role))?role:'user';
		let directory = (role == 'user')?role:'user_acl/'+role;

		const terms_and_conditions_meta = global.SixCRM.routes.include('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.json');
		const terms_and_conditions_document = await this.acquireDocument(directory, account);

		const terms_and_conditions = {
			title: terms_and_conditions_meta.title,
			body: terms_and_conditions_document,
			version: terms_and_conditions_meta.version
		};

		global.SixCRM.validate(terms_and_conditions, global.SixCRM.routes.path('model','helpers/termsandconditions/termsandconditions.json'));

		return terms_and_conditions;

	}

	async acquireDocument(directory, account){

		du.debug('Acquire Document');

		let tokenized_document = await fileutilities.getFileContents(global.SixCRM.routes.path('resources', 'terms-and-conditions/'+directory+'/terms-and-conditions.md'));

		let tokens = await this.getTokenValues(account);

		return parserutilities.parse(tokenized_document, tokens);

	}

	async getTokenValues(account = null){

		du.debug('Get Token Values');

		let tokens = {};

		if(!_.isNull(account)){

			let accountController = new AccountController();

			accountController.disableACLs();
			account = await accountController.get({id: account});
			accountController.enableACLs();

			if(!_.isNull(account) && _.has(account, 'id')){

				tokens.account = account;

			}

		}

		return tokens;

	}

}
