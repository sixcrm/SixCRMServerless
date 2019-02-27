
const _ = require('lodash');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidVendorResponse(){

	return {
		code:'success',
		response:{
			body: ''
		},
		message:'Success'
	};

}

describe('/providers/terminal/Response.js', () => {

	describe('constructor', () => {

		it('successfully constructs', () => {

			const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');
			let terminalResponse = new TerminalResponse();

			expect(objectutilities.getClassName(terminalResponse)).to.equal('TerminalResponse');

		});

	});

	describe('setVendorResponse', () => {

		it('successfully sets the vendor response', () => {

			let vendor_response = getValidVendorResponse();

			const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');
			let terminalResponse = new TerminalResponse();

			terminalResponse.setVendorResponse(vendor_response);
			expect(terminalResponse.parameters.store['vendorresponse']).to.deep.equal(vendor_response);
		});

	});

	describe('setVendorResponse', () => {

		it('successfully sets the provider response', () => {

			let vendor_response = getValidVendorResponse();

			const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');
			let terminalResponse = new TerminalResponse();

			terminalResponse.parameters.set('vendorresponse', vendor_response);

			let result = terminalResponse.getVendorResponse();

			expect(result).to.deep.equal(vendor_response);

		});

		it('successfully get the provider response when the response is not set', () => {

			const TerminalResponse = global.SixCRM.routes.include('providers', 'terminal/Response.js');
			let terminalResponse = new TerminalResponse();

			let result = terminalResponse.getVendorResponse();

			expect(result).to.be.null;

		});

	});

});
