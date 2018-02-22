'use strict'

const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/workers/redshiftEvents', () => {

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

    it('instantiates the redshiftEventsController class', () => {

      let redshiftEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/redshiftEvents.js');

      expect(objectutilities.getClassName(redshiftEventsController)).to.equal('RedshiftEventsController');

    });

  });

  describe('execute', () => {

    it('successfully executes with standard case', () => {

      let session  = MockEntities.getValidSession();
      let product_schedules = MockEntities.getValidProductSchedules();
      let products = MockEntities.getValidProducts();
      let affiliates = MockEntities.getValidAffiliates();

      let test_cases = [
        {
          message: {
            event_type:'lead',
            account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
            user:"system@sixcrm.com",
            context:{
              session: session,
              product_schedules: product_schedules,
              products: products,
              affiliates: affiliates
            }
          },
          result: {}
        }
      ];

      return arrayutilities.reduce(test_cases, (current, test_case) => {

        let sns_message = MockEntities.getValidSNSMessage(test_case.message);

        mockery.registerMock(global.SixCRM.routes.path('lib','kinesis-firehose-utilities.js'),{
          putRecord: (event, event_object) => {
            return Promise.resolve(true);
          }
        });

        let redshiftEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/redshiftEvents.js');

        return redshiftEventsController.execute(sns_message).then(result => {
          expect(result).to.equal(true);
          expect(redshiftEventsController.parameters.store['redshiftobject']).to.deep.equal(test_case.result);
        });

      }, null);

    });

  });

});
