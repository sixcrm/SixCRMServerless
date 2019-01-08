const chai = require('chai');
const expect = chai.expect;

const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

describe('controllers/providers/aws-provider', () => {

	describe('hasCredentials', () => {

		let _process_env = null;

		before(() => {
			_process_env = process.env;
		});

		after(() => {
			process.env = _process_env;
		});

		beforeEach(() => {
			process.env.AWS_ACCOUNT = '123';
			process.env.AWS_REGION = '123';
			process.env.AWS_ACCESS_KEY_ID = '123';
			process.env.AWS_SECRET_ACCESS_KEY = '123';
		});

		afterEach(() => {
			delete process.env.AWS_ACCOUNT;
			delete process.env.AWS_REGION;
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;
		});

		it('returns true when all credentials are present', () => {

			const awsprovider = new AWSProvider();

			let result = awsprovider.hasCredentials();

			expect(result).to.equal(true);

		});

		it('returns a error when some credentials are not present', () => {

			delete process.env.AWS_ACCOUNT;

			const awsprovider = new AWSProvider();

			try{
				awsprovider.hasCredentials();
			}catch(error){
				expect(error.message).to.equal('[500] Missing Credentials in process.env');
			}

		});

		it('returns a error when all credentials are not present', () => {

			delete process.env.AWS_ACCOUNT;
			delete process.env.AWS_REGION;
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;

			const awsprovider = new AWSProvider();

			try{
				awsprovider.hasCredentials();
			}catch(error){
				expect(error.message).to.equal('[500] Missing Credentials in process.env');
			}

		});

		it('returns false when some credentials are not present and fatal is false', () => {

			delete process.env.AWS_SECRET_ACCESS_KEY;

			const awsprovider = new AWSProvider();

			let result = awsprovider.hasCredentials(false);

			expect(result).to.equal(false);

		});

	});

});
