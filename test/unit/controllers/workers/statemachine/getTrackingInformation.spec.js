const chai = require("chai");
//const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
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

  describe('constructor', () => {

    it('successfully constructs', () => {

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      expect(objectutilities.getClassName(getTrackingInformationController)).to.equal('GetTrackingInformationController');

    });

  });

  describe('validateEvent', () => {

    it('successfully validates a valid event', () => {

      const shipping_receipt = MockEntities.getValidShippingReceipt();
      const event = {guid: shipping_receipt.id};

      const GetTrackingInformationController = global.SixCRM.routes.include('workers', 'statemachine/getTrackingInformation.js');
      let getTrackingInformationController = new GetTrackingInformationController();

      let result = getTrackingInformationController.validateEvent(event);
      expect(result).to.deep.equal(event);

    });

  });

  xdescribe('', async () => {
    it('', async () => {

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
                detail: 'The package was delivered'
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

});
