
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const CreditCardTest = global.SixCRM.routes.include('test', 'integration/classes/CreditCard');

describe('Credit Card (Customer) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let creditCardTest = new CreditCardTest();

		return creditCardTest.executeCustomerBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});
