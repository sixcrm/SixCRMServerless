
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const MerchantProviderGroupTest = global.SixCRM.routes.include('test', 'integration/classes/MerchantProviderGroup');

describe('Merchant Provider Group (Product) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let merchantProviderGroupTest = new MerchantProviderGroupTest();

		return merchantProviderGroupTest.executeProductScheduleBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});
