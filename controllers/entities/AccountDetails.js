const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class AccountDetailsController extends entityController {

	constructor() {

		super('accountdetail');

	}

	create({entity, parameters}) {
		du.debug('Create AccountDetails', entity);

		return super.create({entity, parameters});
	}

	getOrCreate() {
		const id = global.account;
		du.debug('Get Or Create', id);

		return super.get({id}).then((accountdetails) => {
			if (!accountdetails) {
				return this.createNew({id})
			} else {
				return accountdetails;
			}
		});
	}

	createNew({id = global.account}) {
		du.debug('Create New', id);

		return this.create(this.newAccountDetails({id}))
	}

	newAccountDetails({id}) {
		return {
			entity: {
				id: id,
				account: id,
				emailtemplatesettings: {custom_blocks: []}
			}
		};
	}

}

module.exports = AccountDetailsController;
