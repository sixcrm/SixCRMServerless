const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');


describe('controllers/workers/statemachine/sendDeliveryNotification.js', () => {

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

      const SendDeliveryNotificationController = global.SixCRM.routes.include('workers', 'statemachine/sendDeliveryNotification.js');
      let sendDeliveryNotificationController = new SendDeliveryNotificationController();

      expect(objectutilities.getClassName(sendDeliveryNotificationController)).to.equal('SendDeliveryNotificationController');

    });

  });

  describe('execute', async () => {

    it('successfully executes', async () => {

      let shipping_receipt = MockEntities.getValidShippingReceipt();

      let event = {
        guid: shipping_receipt.id
      };

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

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class{
        constructor(){}
        pushEvent({event_type, context, message_attributes}){
          expect(event_type).to.be.a('string');
          expect(context).to.be.a('object');
          //expect(message_attributes).to.be.a('object');
          return Promise.resolve(true);
        }
      });

      const SendDeliveryNotificationController = global.SixCRM.routes.include('workers', 'statemachine/sendDeliveryNotification.js');
      let sendDeliveryNotificationController = new SendDeliveryNotificationController();

      let result = await sendDeliveryNotificationController.execute(event);

      expect(result).to.equal(true);

    });


  });

});
