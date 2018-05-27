const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
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

});
