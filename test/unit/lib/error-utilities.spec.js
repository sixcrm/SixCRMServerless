const chai = require('chai');
const expect = chai.expect;

const webhookUrl = 'https://hooks.slack.com/services/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';

describe('lib/error-utilities', () => {

	describe('getErrorByName', () => {

		it('returns new not found error', () => {

			let error = {
				"name":"Not Found Error",
				"message":"[404] Not found.",
				"code":404};

			const errorutilities = global.SixCRM.routes.include('lib', 'error-utilities.js');

			//valid error type
			expect(errorutilities.getErrorByName('not_found_error')).to.deep.equal(error);
		});

		it('returns null when error type is not valid', () => {

			const errorutilities = global.SixCRM.routes.include('lib', 'error-utilities.js');

			//invalid error type
			expect(errorutilities.getErrorByName('an_error')).to.equal(null);
		});
	});

	describe('removeNonAlphaNumeric', () => {

		it('returns only alpha numeric characters from string', () => {

			const errorutilities = global.SixCRM.routes.include('lib', 'error-utilities.js');

			expect(errorutilities.removeNonAlphaNumeric('te*st+err-or')).to.equal('testerror');
		});
	});

	xdescribe('getSlackErrorChannelWebhook', () => {

		it('returns slack error channel webhook url', () => {

			const errorutilities = global.SixCRM.routes.include('lib', 'error-utilities.js');

			expect(errorutilities.getSlackErrorChannelWebhook()).to.equal(webhookUrl);
		});
	});
});
