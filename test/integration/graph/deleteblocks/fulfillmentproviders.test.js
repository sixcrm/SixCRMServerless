
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const FulfillmentProviderTest = global.SixCRM.routes.include('test', 'integration/classes/FulfillmentProvider');

describe('Fulfillment Provider (Product) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let fulfillmentProviderTest = new FulfillmentProviderTest();

		return fulfillmentProviderTest.executeProductBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});
