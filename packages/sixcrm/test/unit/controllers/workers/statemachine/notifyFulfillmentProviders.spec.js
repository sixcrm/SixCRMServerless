const _ = require('lodash');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/workers/statemachine/notifyFulfillmentProviders.js', async () => {

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

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      expect(objectutilities.getClassName(notifyFulfillmentProvidersController)).to.equal('NotifyFulfillmentProvidersController');

    });

  });

  describe('triggerNotifications', async () => {

    it('succesfully pushes notifications', async () => {

      let rebill = MockEntities.getValidRebill();
      const push_event_response = {
        ResponseMetadata: {
          RequestId: '4c52a5b5-14af-574d-b92a-f63033bef994'
        },
        MessageId: '8131b499-5ca8-550f-9cd5-e71c7bb98bd6'
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve(push_event_response);
        }
      });

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      let result = await notifyFulfillmentProvidersController.triggerNotifications({rebill: rebill, fulfillment_request_result: 'success'});

      expect(result).to.deep.equal(push_event_response);

    });

    it('throws an error when missing argumentation (rebill)', async () => {

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      try{
        let result = await notifyFulfillmentProvidersController.triggerNotifications({fulfillment_request_result: 'success'});
        expect(false).to.equal(true, 'method should have thrown an error.');
      }catch(error){
        expect(error.message).to.equal('[500] Expected rebill to have property "id".');
      }

    });

    it('throws an error when missing argumentation (fulfillment_request_result)', async () => {

      let rebill = MockEntities.getValidRebill();

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      try{
        let result = await notifyFulfillmentProvidersController.triggerNotifications({rebill: rebill});
        expect(false).to.equal(true, 'method should have thrown an error.');
      }catch(error){
        expect(error.message).to.equal('[500] Expected fulfillment_request_result to be a non-empty string.');
      }

    });

  });

  describe('triggerFulfillment', async () => {

    it('succesfully triggers fulfillment', async () => {

      let rebill = MockEntities.getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), class {
        constructor(){}
        fulfill({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(new class {
            constructor(){}
            getCode(){
              return 'success';
            }
          });
        }
      });

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      let result = await notifyFulfillmentProvidersController.triggerFulfillment(rebill);

      expect(result).to.equal('success');

    });

  });

  describe('execute', async () => {

    it('succesfully executes', async () => {

      let rebill = MockEntities.getValidRebill();
      const event = {
        guid: rebill.id
      };

      const push_event_response = {
        ResponseMetadata: {
          RequestId: '4c52a5b5-14af-574d-b92a-f63033bef994'
        },
        MessageId: '8131b499-5ca8-550f-9cd5-e71c7bb98bd6'
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve(push_event_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), class {
        constructor(){}
        fulfill({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(new class {
            constructor(){}
            getCode(){
              return 'success';
            }
          });
        }
      });

			mockery.registerMock('@6crm/sixcrm-product-setup', {
				createProductSetupService() {
					return Promise.resolve();
				},
				createProductScheduleService() {
					return Promise.resolve();
				}
			});

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      let result = await notifyFulfillmentProvidersController.execute(event);
      expect(result).to.equal('SUCCESS');

    });

    it('throws an error when the rebill is not returned', async () => {

      let rebill = MockEntities.getValidRebill();
      const event = {
        guid: rebill.id
      };

      const push_event_response = {
        ResponseMetadata: {
          RequestId: '4c52a5b5-14af-574d-b92a-f63033bef994'
        },
        MessageId: '8131b499-5ca8-550f-9cd5-e71c7bb98bd6'
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve(push_event_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(null);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), class {
        constructor(){}
        fulfill({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(new class {
            constructor(){}
            getCode(){
              return 'success';
            }
          });
        }
      });

			mockery.registerMock('@6crm/sixcrm-product-setup', {
				createProductSetupService() {
					return Promise.resolve();
				},
				createProductScheduleService() {
					return Promise.resolve();
				}
			});

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      try{
        await notifyFulfillmentProvidersController.execute(event);
        expect(false).to.equal(true, 'Method should have thrown an error.');
      }catch(error){
        expect(error.message).to.have.string('[500] Unable to acquire a rebill that matches');
      }

    });

    it('throws an error when the terminal response is "error"', async () => {

      let rebill = MockEntities.getValidRebill();
      const event = {
        guid: rebill.id
      };

      const push_event_response = {
        ResponseMetadata: {
          RequestId: '4c52a5b5-14af-574d-b92a-f63033bef994'
        },
        MessageId: '8131b499-5ca8-550f-9cd5-e71c7bb98bd6'
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve(push_event_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('providers', 'terminal/Terminal.js'), class {
        constructor(){}
        fulfill({rebill}){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve(new class {
            constructor(){}
            getCode(){
              return 'error';
            }
          });
        }
      });

			mockery.registerMock('@6crm/sixcrm-product-setup', {
				createProductSetupService() {
					return Promise.resolve();
				},
				createProductScheduleService() {
					return Promise.resolve();
				}
			});

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      try{
        await notifyFulfillmentProvidersController.execute(event);
        expect(false).to.equal(true, 'Method should have thrown an error.');
      }catch(error){
        expect(error.message).to.have.string('[500] Terminal Controller returned an error:');
      }

    });

  });

  xdescribe('execute (LIVE)', async () => {

    it('succesfully executes', async () => {

      let customer = MockEntities.getValidCustomer();
      customer.email = 'tmdalbey@gmail.com';
      customer.firstname = 'Timothy';
      customer.lastname = 'Dalbey';
      customer.phone = '5037055257';
      customer.address = {
        line1: '6738 N. Willamette BLVD.',
        city: 'Portland',
        state: 'OR',
        zip: '97203',
        country: 'US'
      };

      console.log(customer);

      let session = MockEntities.getValidSession();
      session.customer = customer.id
      console.log(session);

      let fulfillment_provider = MockEntities.getValidFulfillmentProvider();
      fulfillment_provider.name = 'Live Hashtag';
      fulfillment_provider.provider = {
        name: 'Hashtag',
        username: 'CRMBB-test',
        password: 'CRMBB-test',
        threepl_customer_id: 422,
        threepl_key: '{a240f2fb-ff00-4a62-b87b-aecf9d5123f9}'
      };

      console.log(fulfillment_provider);

      let product = MockEntities.getValidProduct();
      product.sku = 'PJF-1';
      product.shipping_delay = 0;
      product.fulfillment_provider = fulfillment_provider.id;
      product.default_price = 0.00;
      product.attributes = {};
      product.name = 'Pure Joel Fazio';
      product.ship = true;

      console.log(product);

      let rebill = MockEntities.getValidRebill();
      rebill.bill_at = timestamp.getISO8601();
      rebill.parentsession = session.id;
      delete rebill.product_schedules;
      rebill.products = [
        {
          quantity: 1,
          product: product,
          amount: 0.00
        }
      ];
      console.log(rebill);

      let transaction = MockEntities.getValidTransaction();
      transaction.rebill = rebill.id;
      transaction.products = [
        {
          quantity: 1,
          product: product,
          amount: 0.00
        }
      ];

      console.log(transaction);

      const event = {
        guid: rebill.id
      };

      const push_event_response = {
        ResponseMetadata: {
          RequestId: '4c52a5b5-14af-574d-b92a-f63033bef994'
        },
        MessageId: '8131b499-5ca8-550f-9cd5-e71c7bb98bd6'
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
        constructor(){}
        pushEvent(){
          return Promise.resolve(push_event_response);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(transaction);
        }
        update({entity}){
          expect(entity).to.be.a('object');
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
        constructor(){
          this.descriptive_name = 'rebill'
        }
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(rebill);
        }
        listTransactions(rebill){
          expect(rebill).to.be.a('object');
          expect(rebill).to.have.property('id');
          return Promise.resolve({transactions: [transaction]});
        }
        getResult(result, field){
          if(_.isUndefined(field)){
          	field = this.descriptive_name+'s';
          }
          if(_.has(result, field)){
          	return Promise.resolve(result[field]);
          }else{
          	return Promise.resolve(null);
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'FulfillmentProvider.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(fulfillment_provider);
        }
        sanitize(sanitize) {
      		if (!_.isBoolean(sanitize)) {
      			throw eu.getError('server', 'sanitize argument is not a boolean.');
      		}
      		this.sanitization = sanitize;
      		return this;
      	}
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        constructor(){}
        get({id}){
          expect(id).to.be.a('string');
          return Promise.resolve(session);
        }
        getCustomer(session){
          expect(session).to.be.a('object');
          return Promise.resolve(customer);
        }
      });

			mockery.registerMock('@6crm/sixcrm-product-setup', {
				createProductSetupService() {
					return Promise.resolve();
				},
				createProductScheduleService() {
					return Promise.resolve();
				}
			});

      const NotifyFulfillmentProvidersController = global.SixCRM.routes.include('workers', 'statemachine/notifyFulfillmentProviders.js');
      let notifyFulfillmentProvidersController = new NotifyFulfillmentProvidersController();

      let result = await notifyFulfillmentProvidersController.execute(event);
      expect(result).to.equal('SUCCESS');

    });

  });

});
