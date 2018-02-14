'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class binController extends entityController {

	constructor() {
		super('bin');
	}

	getCreditCardProperties({ binnumber }) {

		du.debug('Get Credit Card Properties');

		//Technical Debt: this could use some validation
		this.primary_key = 'binnumber';

		return this.get({ id: binnumber });

	}

}

module.exports = new binController();
