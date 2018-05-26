const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');


describe('controllers/workers/statemachine/getTrackingNumber.js', () => {

  before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

  describe('constructor', () => {

    it('successfully constructs', () => {

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      expect(objectutilities.getClassName(getTrackingNumberController)).to.equal('GetTrackingNumberController');

    });

  });

  describe('respond', () => {

    it('successfully responds with a tracking number', () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      expect(getTrackingNumberController.respond(shipping_receipt.tracking.id)).to.equal(shipping_receipt.tracking.id);

    });

    it('successfully responds with a "NOTRACKING" (null case)', () => {

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      expect(getTrackingNumberController.respond(null)).to.equal('NOTRACKING');

    });

    it('successfully responds with a "NOTRACKING" (empty string case)', () => {

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      expect(getTrackingNumberController.respond('')).to.equal('NOTRACKING');

    });

    it('successfully responds with a "NOTRACKING" (non-string string case)', () => {

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      expect(getTrackingNumberController.respond(123)).to.equal('NOTRACKING');

    });

  });

});
