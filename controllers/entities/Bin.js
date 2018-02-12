'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class binController extends entityController {

	constructor() {
		super('bin');
	}

	getCreditCardProperties({ binnumber }) {

		du.debug('Get Credit Card Properties');

		return this.executeAssociatedEntityFunction('binController', 'get', { binnumber: binnumber });

	}

}

module.exports = new binController();
