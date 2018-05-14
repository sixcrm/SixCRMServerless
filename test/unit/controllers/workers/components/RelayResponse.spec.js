const chai = require("chai");
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('controllers/workers/components/RelayResponse.js', function () {

	describe('constructor', () => {

		it('successfully constructs', () => {

			const RelayResponseController = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relayResponseController = new RelayResponseController();

			expect(objectutilities.getClassName(relayResponseController)).to.equal('RelayResponse');
		});

		it('successfully constructs when response type is specified and valid', () => {

			const RelayResponseController = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relayResponseController = new RelayResponseController('success');

			expect(objectutilities.getClassName(relayResponseController)).to.equal('RelayResponse');
		});
	});

	describe('setResponse', () => {

		it('successfully sets response', () => {

			let response_types = ['success', 'decline', 'error', 'noaction']; //valid response types

			const RelayResponseController = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relayResponseController = new RelayResponseController();

			response_types.forEach(response_type => {

				relayResponseController.setResponse(response_type);

				expect(relayResponseController.response.code).to.be.defined;
				expect(relayResponseController.response.code).to.equal(response_type);

			})
		});

		it('throws error when response type is unexpected', () => {

			let response_types = ['any_string', '123', 'any_string123', 123, 123.123, -123, -123.123, [], {}, () => {}, true];

			const RelayResponseController = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relayResponseController = new RelayResponseController();

			response_types.forEach(response_type => {

				try {
					relayResponseController.setResponse(response_type);
				} catch (error) {
					expect(error.message).to.equal('[500] Unexpected Response Type: "'+response_type+'".');
				}

			})
		});
	});

	describe('getCode', () => {

		it('returns null when response code is undefined', () => {

			const RelayResponseController = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relayResponseController = new RelayResponseController();

			delete relayResponseController.response;

			expect(relayResponseController.getCode()).to.equal(null);
		});

		it('returns response code when it exists', () => {

			const RelayResponseController = global.SixCRM.routes.include('workers', 'components/RelayResponse.js');
			let relayResponseController = new RelayResponseController();

			//valid code
			relayResponseController.response = {
				code: 'success'
			};

			expect(relayResponseController.getCode()).to.equal(relayResponseController.response.code);
		});
	});
});
