
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const CustomerTest = global.SixCRM.routes.include('test', 'integration/classes/Customer');

describe('Customer (Customer Note) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let customerTest = new CustomerTest();

		return customerTest.executeCustomerNoteBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});

describe('Customer (Session) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let customerTest = new CustomerTest();

		return customerTest.executeSessionBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});
