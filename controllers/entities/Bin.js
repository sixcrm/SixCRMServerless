
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class BinController extends entityController {

	constructor() {
		super('bin');
		this.primary_key = 'binnumber';
	}

	getCreditCardProperties({ binnumber }) {

		du.debug('Get Credit Card Properties');

		//Technical Debt: this could use some validation
		this.primary_key = 'binnumber';

		return this.get({ id: binnumber })
			.then(data => {

				du.debug(data);
				return data;
			});

	}

};
