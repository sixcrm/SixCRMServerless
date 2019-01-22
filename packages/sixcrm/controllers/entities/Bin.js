const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

module.exports = class BinController extends entityController {

	constructor() {
		super('bin');
		this.primary_key = 'binnumber';
	}

	getCreditCardProperties({ binnumber }) {
		//Technical Debt: this could use some validation
		this.primary_key = 'binnumber';

		return this.get({ id: binnumber });
	}

	delete({id, range_key = null}) {
		if (global.account !== '*') {
			throw eu.getError('server', 'You are not allowed to delete the entity.')
		}

		return super.delete({id, range_key})
	}

};
