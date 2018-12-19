const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class AccountDetailsController extends entityController {

	constructor() {

		super('accountdetail');

	}

	create({entity, parameters}) {
		return super.create({entity, parameters});
	}

	getOrCreate() {
		const id = global.account;

		return super.get({id}).then((accountdetails) => {
			if (!accountdetails) {
				return this.createNew({id})
			} else {
				return accountdetails;
			}
		});
	}

	createNew({id = global.account}) {
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

	getDefaultCompanyLogoPath() {
		return `https://s3.amazonaws.com/sixcrm-${global.SixCRM.configuration.stage}-account-resources/global/product-default-image.png`
	}

}

module.exports = AccountDetailsController;
