'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidMerchantProviderSummary(){

  return MockEntities.getValidMerchantProviderSummary();

}

describe('/helpers/entities/merchantprovidersummary/MerchantProviderSummary.json', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
      let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

      expect(objectutilities.getClassName(merchantProviderSummaryHelperController)).to.equal('MerchantProviderSummaryHelperController');

    });

  });

  describe('incrementSummary', () =>{

    it('successfully increments total and count', () => {

      mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), {
        update:({entity}) => {
          return Promise.resolve(entity);
        }
      });

      const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
      let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

      //Technical Debt:  This is busted... fix.
      let test_cases = [
        {
          summary: {
            total: 123456.01,
            count: 22
          },
          total: 12.91,
          results:{
            count: 23,
            total: (123456.01 + 12.91)
          }
        }
      ];

      let promises = arrayutilities.map(test_cases, test_case => {

        let mps = getValidMerchantProviderSummary();

        mps.total = test_case.summary.total;
        mps.count = test_case.summary.count;

        merchantProviderSummaryHelperController.parameters.set('merchantprovidersummary', mps);
        merchantProviderSummaryHelperController.parameters.set('total', test_case.total);

        return () => {
          return merchantProviderSummaryHelperController.incrementSummary().then((result) => {
            expect(result).to.equal(true);
            let updated_merchant_provider_summary = merchantProviderSummaryHelperController.parameters.get('merchantprovidersummary');

            expect(updated_merchant_provider_summary.total).to.equal(test_case.results.total);
            expect(updated_merchant_provider_summary.count).to.equal(test_case.results.count);
          });
        };

      });

      return arrayutilities.serial(promises, (current, next) => {
        return next().then(() => {
          return true;
        });
      },null);

    });

  });

});
