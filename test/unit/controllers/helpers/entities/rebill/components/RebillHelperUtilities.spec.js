
let chai = require('chai');
const expect = chai.expect;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const numberutilities = require('@6crm/sixcrmcore/util/number-utilities').default;
const RebillHelperUtilitiesController = global.SixCRM.routes.include('helpers', 'entities/rebill/components/RebillHelperUtilities.js');

function getValidSession() {
	return MockEntities.getValidSession()
}

function getValidTransactionProducts(ids, expanded) {
	return MockEntities.getValidTransactionProducts(ids, expanded);
}

describe('helpers/entities/rebill/components/RebillHelperUtilities.js', () => {

	describe('calculateDayInCycle', () => {

		it('returns number of days since session is created', () => {

			let session = getValidSession();

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});
			rebillHelperUtilitiesController.parameters.set('session', session);

			expect(rebillHelperUtilitiesController.calculateDayInCycle()).to.equal(0);
			expect(rebillHelperUtilitiesController.parameters.store['day'])
				.to.equal(0);
		});

		it('returns number of days when session creation day is specified', () => {

			let created_at = timestamp.getISO8601();

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});

			expect(rebillHelperUtilitiesController.calculateDayInCycle(created_at)).to.equal(0);
			expect(rebillHelperUtilitiesController.parameters.store['day'])
				.to.equal(0);

		});

		it('returns number of days when session creation day is set to day before', () => {

			let created_at = timestamp.yesterday();

			created_at = timestamp.castToISO8601(created_at);

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});

			expect(rebillHelperUtilitiesController.calculateDayInCycle(created_at)).to.equal(1);
			expect(rebillHelperUtilitiesController.parameters.store['day'])
				.to.equal(1);

		});

		it('throws error when neither session nor "created_at" are specified', () => {

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});

			try {
				rebillHelperUtilitiesController.calculateDayInCycle();
			} catch (error) {
				expect(error.message).to.equal('[500] created_at is not a proper ISO-8601');
			}
		});

		it('throws error when "created_at" is not an ISO-8601', () => {

			let invalid_created_at_dates = ['unexpected_element', '123', '-123', '', 123, 11.22, -123, true, {}, [], () => {}, '1.03.2018'];

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});

			invalid_created_at_dates.forEach(invalid_created_at_date => {
				try {
					rebillHelperUtilitiesController.calculateDayInCycle(invalid_created_at_date);
				} catch (error) {
					expect(error.message).to.equal('[500] created_at is not a proper ISO-8601');
				}
			});
		});
	});

	describe('calculateAmount', () => {

		it('sets amount to 0 when there aren\'t any transaction products', () => {

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});

			return rebillHelperUtilitiesController.calculateAmount().then((result) => {
				expect(result).to.equal(true);
				return expect(rebillHelperUtilitiesController.parameters.store['amount'])
					.to.equal(0);
			});
		});

		it('successfully calculates total amount of transaction products depending on their quantity and amount', () => {

			let sum = 0;

			let transaction_products = getValidTransactionProducts();

			let rebillHelperUtilitiesController = new RebillHelperUtilitiesController();

			rebillHelperUtilitiesController.parameters = new Parameters({validation: {}, definition: {}});
			rebillHelperUtilitiesController.parameters.set('transactionproducts', transaction_products);

			transaction_products.forEach(product => {
				sum += product.amount * product.quantity;
			});

			return rebillHelperUtilitiesController.calculateAmount().then((result) => {
				expect(result).to.equal(true);
				return expect(rebillHelperUtilitiesController.parameters.store['amount'])
					.to.equal(numberutilities.formatFloat(sum, 2));
			});
		});
	});
});