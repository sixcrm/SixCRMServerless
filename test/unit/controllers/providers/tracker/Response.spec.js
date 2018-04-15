let chai = require('chai');
let expect = chai.expect;

function getValidVendorResponse(){

	return {
		code:'success',
		response:{
			body: ''
		},
		message:'Success'
	};

}

describe('controllers/providers/tracker/Response.js', function () {

	describe('setVendorResponse', () => {

		it('successfully sets vendor response', () => {

			let vendor_response = getValidVendorResponse();

			const TrackerResponse = global.SixCRM.routes.include('providers', 'tracker/Response.js');
			let trackerResponse = new TrackerResponse();

			trackerResponse.setVendorResponse(vendor_response);

			expect(trackerResponse.parameters.store['vendorresponse']).to.deep.equal(vendor_response);
		});
	});

	describe('getVendorResponse', () => {

		it('successfully gets vendor response', () => {

			let vendor_response = getValidVendorResponse();

			const TrackerResponse = global.SixCRM.routes.include('providers', 'tracker/Response.js');
			let trackerResponse = new TrackerResponse();

			trackerResponse.parameters.set('vendorresponse', vendor_response);

			expect(trackerResponse.getVendorResponse()).to.deep.equal(vendor_response);
		});
	});
});