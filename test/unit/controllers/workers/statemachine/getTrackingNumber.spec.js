const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');


describe('controllers/workers/statemachine/getTrackingNumber.js', async () => {

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

  describe('updateShippingReceiptWithTrackingNumberAndCarrier', async () => {

    it('successfully updates a shipping receipt with a tracking number', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      const tracking = shipping_receipt.tracking;
      delete shipping_receipt.tracking;

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
        constructor(){}
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let result = await getTrackingNumberController.updateShippingReceiptWithTrackingNumberAndCarrier({shipping_receipt: shipping_receipt, tracking: tracking});
      expect(result).to.equal(true);

    });

  });

  describe('getTrackingInformationFromFulfillmentProvider', async () => {

    it('gets the tracking number and carrier information from the fulfillment provider', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = shipping_receipt.tracking;
      delete shipping_receipt.tracking;

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let tracking_information = await getTrackingNumberController.getTrackingInformationFromFulfillmentProvider(shipping_receipt);
      expect(tracking_information).to.deep.equal(tracking);

    });

    it('throws a error for a non-success response', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = shipping_receipt.tracking;
      delete shipping_receipt.tracking;

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'not success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      try {
        let tracking_information = await getTrackingNumberController.getTrackingInformationFromFulfillmentProvider(shipping_receipt);
        expect(false).to.equal(true);
      }catch(error){
        expect(error.message).to.equal('[500] Terminal returned a non-success code: not success');
      }

    });

    it('throws a error for a unexpected response (no "id" property)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = {};
      delete shipping_receipt.tracking;

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let tracking_information = await getTrackingNumberController.getTrackingInformationFromFulfillmentProvider(shipping_receipt);
      expect(tracking).to.deep.equal(tracking_information);

    });

    it('throws a error for a unexpected response (no "carrier" property)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = {id: shipping_receipt.tracking.id};
      delete shipping_receipt.tracking;

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let tracking_information = await getTrackingNumberController.getTrackingInformationFromFulfillmentProvider(shipping_receipt);
      expect(tracking).to.deep.equal(tracking_information);

    });

  });

  describe('getTrackingNumberByShippingReceipt', async () => {

    it('successfully returns the tracking number for a shipping receipt (tracking number present)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let result = await getTrackingNumberController.getTrackingNumberByShippingReceipt(shipping_receipt);
      expect(result).to.equal(shipping_receipt.tracking.id);

    });

    it('successfully returns the tracking number for a shipping receipt (no tracking number)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      const tracking = shipping_receipt.tracking;
      delete shipping_receipt.tracking;

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let result = await getTrackingNumberController.getTrackingNumberByShippingReceipt(shipping_receipt);
      expect(result).to.equal(shipping_receipt.tracking.id);

    });

  });

  describe('execute', async () => {

    it('successfully retrieves a tracking number from the fulfillment provider, updates the shipping receipt and responds', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = shipping_receipt.tracking;
      delete shipping_receipt.tracking;
      shipping_receipt.history = [];

      const event = {
        guid: shipping_receipt.id
      }

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let result = await getTrackingNumberController.execute(event);
      expect(result).to.equal(tracking.id);

    });

    it('successfully returns "NOTRACKING"', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = {};
      delete shipping_receipt.tracking;
      shipping_receipt.history = [];

      const event = {
        guid: shipping_receipt.id
      }

      mockery.registerMock(global.SixCRM.routes.path('providers','terminal/Terminal.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return new class {
            constructor(){}
            getCode(){
              return 'success';
            }
            getVendorResponse(){
              return tracking;
            }
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','ShippingReceipt.js'), class {
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
        update({entity}){
          expect(entity).to.be.a('object');
          expect(entity).to.have.property('id');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingNumberController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingNumber.js');
      let getTrackingNumberController = new GetTrackingNumberController();

      let result = await getTrackingNumberController.execute(event);
      expect(result).to.equal('NOTRACKING');

    });

  });

});
