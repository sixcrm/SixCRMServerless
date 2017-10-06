let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const PermissionTestGenerators = require('../lib/permission-test-generators');

function getValidAffiliateIDsArray(){
  return ['F4ZT4TDRYC'];
}

function getValidAffiliateObject(){
  return {id: 'f5e9e1c5-4989-460e-8014-17a0682ffb41', affiliate_id: 'F4ZT4TDRYC'};
}

describe('controllers/entities/Affiliate.js', () => {

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  afterEach(() => {
      mockery.resetCache();
  });

  after(() => {
      mockery.deregisterAll();
  });

  describe('Validate Assured Affiliates', () => {

    let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

    it('fails when no arguments are provided', () => {

      try{
        affiliateController.validateAssuredAffiliates();
      }catch(error){
        //Technical Debt:  This needs to be handled
        expect(error.message).to.equal('Cannot match against \'undefined\' or \'null\'.')
      }

    });

    it('fails when bad arguments are provided', () => {

      let bad_arguments = [null, 'a', undefined, null, {}, () => {}];

      arrayutilities.map(bad_arguments, bad_argument_1 => {
        arrayutilities.map(bad_arguments, bad_argument_2 => {
          try{
            affiliateController.validateAssuredAffiliates({affiliate_ids: bad_argument_1, assured_affiliates: bad_argument_2});
          }catch(error){
            expect(error.message).to.be.defined;
          }
        });
      });

    });

    it('succeeds', () => {

      let valid_affiliate_ids_array  = getValidAffiliateIDsArray();
      let valid_affiliate_object = getValidAffiliateObject();

      let assured_affiliates = affiliateController.validateAssuredAffiliates({
        affiliate_ids: valid_affiliate_ids_array,
        assured_affiliates: [valid_affiliate_object]
      });

      expect(assured_affiliates).to.deep.equal([valid_affiliate_object]);

    });

  });

  describe('Assure Affiliates Array Transform', () => {

    it('fails with no argumentation', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      try{
        affiliateController.assureAffiliatesArrayTransform();
      }catch(error){
        expect(error.message).to.equal('Cannot match against \'undefined\' or \'null\'.');
      }

    });

    it('fails with bad argumentation', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      let bad_arguments = [null, 'a', undefined, null, {}, () => {}];

      arrayutilities.map(bad_arguments, bad_argument_1 => {
        arrayutilities.map(bad_arguments, bad_argument_2 => {
          try{
            affiliateController.assureAffiliatesArrayTransform({affiliate_ids: bad_argument_1, affiliates: bad_argument_2});
          }catch(error){
            expect(error.message).to.be.defined;
          }
        });
      });

    });

    //Technical Debt:  Fix
    it('succeeds when unableable to match affiliates', () => {

      PermissionTestGenerators.givenUserWithAllowed('create', 'affiliate');

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
          queryRecords: (table, parameters, index) => {
              return Promise.resolve([]);
          },
          saveRecord: (table, entity) => {
              return Promise.resolve(entity);
          }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
          addToSearchIndex: (entity, entity_type) => {
              return Promise.resolve(true);
          }
      });
      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
           createActivity: () => {
              return Promise.resolve();
          }
      });

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      let valid_affiliate_ids_array = getValidAffiliateIDsArray();

      affiliateController.assureAffiliatesArrayTransform({
        affiliate_ids: valid_affiliate_ids_array,
        affiliates: []
      }).then(assured_affiliates => {
        expect(assured_affiliates.length).to.equal(1);
        expect(assured_affiliates.shift().affiliate_id).to.equal(valid_affiliate_ids_array.shift);
      });

    });

    it('succeeds when able to match affiliates', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      let valid_affiliate_ids_array = getValidAffiliateIDsArray();
      let valid_affiliate_object = getValidAffiliateObject();

      affiliateController.assureAffiliatesArrayTransform({affiliate_ids: valid_affiliate_ids_array, affiliates: [valid_affiliate_object]}).then(assured_affiliates => {
        expect(assured_affiliates).to.deep.equal([valid_affiliate_object]);
      });

    });

  });

  describe('Validate Assure Affiliates Array', () => {

    it('fails when affiliate array is not provided', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      try{
        affiliateController.validateAssureAffiliatesArray();
      }catch(error){
        expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
      }

    });

    it('fails when affiliate array is null', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      try{
        affiliateController.validateAssureAffiliatesArray(null);
      }catch(error){
        expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
      }

    });

    it('fails when affiliate array is an empty object', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      try{
        affiliateController.validateAssureAffiliatesArray({});
      }catch(error){
        expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
      }

    });

    it('fails when affiliate array is empty', () => {

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      try{
        affiliateController.validateAssureAffiliatesArray([]);
      }catch(error){
        expect(error.message).to.equal('[500] Array is empty.');
      }

    });

    it('fails when affiliate array has non-string entries', () => {

      let bad_arrays = [
        [null],
        [''],
        [{}],
        [undefined],
        ['abc', null],
        ['abc', ''],
        ['abc', {}],
        ['abc', undefined]
      ];

      let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate');

      arrayutilities.map(bad_arrays, bad_array => {

        try{
          affiliateController.validateAssureAffiliatesArray(bad_array);
        }catch(error){
          expect(error.message).to.equal('[500] affiliateController.assureAffiliates assumes all affiliate ID\'s are strings.');
        }

      });

    });

  });

});
