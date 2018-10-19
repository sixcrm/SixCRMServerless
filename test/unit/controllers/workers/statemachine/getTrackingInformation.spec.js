const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/getTrackingInformation.js', () => {

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

	after(() => {
		mockery.disable();
	});

  describe('constructor', () => {

    it('successfully constructs', () => {

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      expect(objectutilities.getClassName(getTrackingInformationController)).to.equal('GetTrackingInformationController');

    });

  });

  describe('getTrackingInformation', async () => {
    it('returns tracking information', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'tracker/Tracker.js'), class{
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return Promise.resolve(new class {
            getVendorResponse(){
              return {
                status: 'unknown',
                detail: 'A status update is not yet available for your package. It will be available when the shipper provides an update or the package is delivered to USPS. Check back soon. Sign up for Informed Delivery<SUP>&reg;</SUP> to receive notifications for packages addressed to you.',
                tracking_number: shipping_receipt.tracking.id
              }
            }
          })
        }
      });

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      let result = await getTrackingInformationController.getTrackingInformation(shipping_receipt);

      expect(result).to.have.property('status');
      expect(result).to.have.property('detail');

    });

    it('throws an error for unexpected response (missing status)', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'tracker/Tracker.js'), class{
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          expect(shipping_receipt).to.have.property('id');
          return Promise.resolve(new class {
            getVendorResponse(){
              return {}
            }
          })
        }
      });

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      try{
        await getTrackingInformationController.getTrackingInformation(shipping_receipt);
        expect(false).to.equal(true,'Method should not have executed');
      }catch(error){
        expect(error.message).to.have.string('[500] Expected tracker response to have property');
      }

    });

  });

  describe('updateShippingReceiptWithTrackingInformation', async () => {

    it('successfully updates the shipping receipt', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      let tracking = {
        status: 'unknown',
        detail: 'Some detail...',
        tracking_number: shipping_receipt.tracking.id
      }

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
        update({entity: entity}){
          expect(entity).to.be.a('object');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      let result = await getTrackingInformationController.updateShippingReceiptWithTrackingInformation({shipping_receipt: shipping_receipt, tracking: tracking});
      expect(result).to.equal(true);

    });

  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      shipping_receipt.tracking = {
        carrier: 'USPS',
        id: '7LTZSYRTF9'
      };

      let event = {
        guid: shipping_receipt.id
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class{
        constructor(){}
        pushEvent({event_type, context, message_attributes}){
          expect(event_type).to.be.a('string');
          expect(context).to.be.a('object');
          expect(message_attributes).to.be.a('object');
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'tracker/Tracker.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          return new class {
            getVendorResponse(){
              return {
                status: 'delivered',
                detail: 'The package was delivered',
                tracking_number: shipping_receipt.tracking.id
              }
            }
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
        update({entity: entity}){
          expect(entity).to.be.a('object');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      try{

        let result = await getTrackingInformationController.execute(event);
        expect(result).to.equal('DELIVERED');

      }catch(error){

        expect(error).to.equal(null, error.message);

      }

    });

  });

  xdescribe('execute (LIVE)', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();
      shipping_receipt.tracking = {
        carrier: 'USPS',
        id: '9374869903502874177377'
        //id:'9374869903502591338013'
      };

      let event = {
        guid: shipping_receipt.id
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class{
        constructor(){}
        pushEvent({event_type, context, message_attributes}){
          expect(event_type).to.be.a('string');
          expect(context).to.be.a('object');
          expect(message_attributes).to.be.a('object');
          return Promise.resolve(true);
        }
      });

      /*
      mockery.registerMock(global.SixCRM.routes.path('providers', 'tracker/Tracker.js'), class {
        constructor(){}
        info({shipping_receipt}){
          expect(shipping_receipt).to.be.a('object');
          return new class {
            getVendorResponse(){
              return {
                status: 'delivered',
                detail: 'The package was delivered',
                tracking_number: shipping_receipt.tracking.id
              }
            }
          }
        }
      });

      */

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), class{
        constructor(){}
        get({id: id}){
          expect(id).to.be.a('string');
          return Promise.resolve(shipping_receipt);
        }
        update({entity: entity}){
          expect(entity).to.be.a('object');
          entity.updated_at = timestamp.getISO8601();
          return Promise.resolve(entity);
        }
      });

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      try{

        let result = await getTrackingInformationController.execute(event);
        expect(result).to.equal('DELIVERED');
        console.log(result);

      }catch(error){

        expect(error).to.equal(null, error.message);

      }

    });

  });

});
