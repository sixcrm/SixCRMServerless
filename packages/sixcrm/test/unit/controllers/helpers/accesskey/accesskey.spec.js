
let chai = require('chai');
let expect = chai.expect;

let du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const accessKeyHelperController = global.SixCRM.routes.include('helpers', 'accesskey/AccessKey.js');

describe('helpers/transaction/Process.spec.js', () => {

	it('creates a access key', () => {

		let accesskey = accessKeyHelperController.generateAccessKey();

		expect(typeof accesskey).to.equal('string');
		expect(accesskey.length).to.equal(40);

	});

	it('creates a secret key', () => {

		let secretkey = accessKeyHelperController.generateSecretKey();

		expect(typeof secretkey).to.equal('string');
		expect(secretkey).to.match(/^[0-9a-f]{40}$/);

	});

});
