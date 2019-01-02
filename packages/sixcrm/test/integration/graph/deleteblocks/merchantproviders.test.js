
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const MerchantProviderTest = global.SixCRM.routes.include('test', 'integration/classes/MerchantProvider');

describe('Merchant Provider Group Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let merchantProviderTest = new MerchantProviderTest();

		return merchantProviderTest.executeMerchantProviderGroupBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});

/*
describe('Merchant Provider (Transaction) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let merchantProviderTest = new MerchantProviderTest();

    return merchantProviderTest.executeTransactionBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});
*/
