'use strict'
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/workers/snsevents/trackingEvents', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.resetCache();
    mockery.deregisterAll();
  });

  beforeEach(() => {
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('instantiates the trackingEventsController class', () => {

      let trackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');

      expect(objectutilities.getClassName(trackingEventsController)).to.equal('TrackingEventsController');

    });

  });

  describe('execute', () => {

    it('successfully executes against cases', () => {

      let session  = MockEntities.getValidSession('668ad918-0d09-4116-a6fe-0e8a9eda36f7');

      let test_cases = [
        {
          message: {
            event_type:'lead',
            account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
            user:"system@sixcrm.com",
            context:{
              session: session
            }
          }
        }
      ];

      return arrayutilities.reduce(test_cases, (current, test_case) => {

        let sns_message = MockEntities.getValidSNSMessage(test_case.message);

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
          get:()=>{
            return Promise.resolve(session);
          }
        });

        mockery.registerMock(global.SixCRM.routes.include('helpers', 'entities/tracker/Tracker.js'), class {
          constructor(){}
          handleTracking(){
            return Promise.resolve(true);
          }
        });

        let trackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');

        return trackingEventsController.execute(sns_message).then(result => {
          expect(result).to.equal(true);
        });

      }, null);

    });

  });

});
