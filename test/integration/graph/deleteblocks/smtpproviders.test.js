
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const SMTPProviderTest = global.SixCRM.routes.include('test', 'integration/classes/SMTPProvider');

describe('SMTP Provider (Email Template) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let sMTPProviderTest = new SMTPProviderTest();

		return sMTPProviderTest.executeEmailTemplateBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});
