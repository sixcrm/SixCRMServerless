'use strict'

const mockery = require('mockery');
let chai = require('chai');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let AffiliateHelperController = global.SixCRM.routes.include('helpers', 'entities/affiliate/Affiliate.js');

function getValidAffiliateIDsArray(){
  return ['F4ZT4TDRYC'];
}

function getValidAffiliateObject(){
  return {id: 'f5e9e1c5-4989-460e-8014-17a0682ffb41', affiliate_id: 'F4ZT4TDRYC'};
}

describe('controllers/helpers/entities/affiliate/Affiliate.js', () => {

  beforeEach(() => {
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

  describe('Validate Assured Affiliates', () => {

    let affiliateHelperController = new AffiliateHelperController();

    it('fails when no arguments are provided', () => {

      try{

        affiliateHelperController.validateAssuredAffiliates({});

      }catch(error){
        du.error(error);
        //Technical Debt:  This needs to be handled
        expect(error.message).to.include('[500] validateAssuredAffiliates assumes affiliate_ids input.')
      }

    });

    it('fails when bad arguments are provided', () => {

      let bad_arguments = [null, 'a', undefined, null, {}, () => {}];

      arrayutilities.map(bad_arguments, bad_argument_1 => {
        arrayutilities.map(bad_arguments, bad_argument_2 => {
          try{
            affiliateHelperController.validateAssuredAffiliates({affiliate_ids: bad_argument_1, assured_affiliates: bad_argument_2});
          }catch(error){
            expect(error.message).to.be.defined;
          }
        });
      });

    });

    it('succeeds', () => {

      let valid_affiliate_ids_array  = getValidAffiliateIDsArray();
      let valid_affiliate_object = getValidAffiliateObject();

      let assured_affiliates = affiliateHelperController.validateAssuredAffiliates({
        affiliate_ids: valid_affiliate_ids_array,
        assured_affiliates: [valid_affiliate_object]
      });

      expect(assured_affiliates).to.deep.equal([valid_affiliate_object]);

    });

  });

  describe('Assure Affiliates Array Transform', () => {

    it('fails with no argumentation', () => {

      let affiliateHelperController = new AffiliateHelperController();

      try{
        affiliateHelperController.assureAffiliatesArrayTransform({});
      }catch(error){
        expect(error.message).to.include('[500] assureAffiliatesArrayTransform assumes affiliate_ids input');
      }

    });

    it('fails with bad argumentation', () => {

      let affiliateHelperController = new AffiliateHelperController();

      let bad_arguments = [null, 'a', undefined, null, {}, () => {}];

      arrayutilities.map(bad_arguments, bad_argument_1 => {
        arrayutilities.map(bad_arguments, bad_argument_2 => {
          try{
            affiliateHelperController.assureAffiliatesArrayTransform({affiliate_ids: bad_argument_1, affiliates: bad_argument_2});
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
          queryRecords: () => {
              return Promise.resolve([]);
          },
          saveRecord: (table, entity) => {
              return Promise.resolve(entity);
          }
      });

      let mock_preindexing_helper = class {
        constructor(){

        }
        addToSearchIndex(){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
           createActivity: () => {
              return Promise.resolve();
          }
      });

      let affiliateHelperController = new AffiliateHelperController();

      let valid_affiliate_ids_array = getValidAffiliateIDsArray();

      return affiliateHelperController.assureAffiliatesArrayTransform({
        affiliate_ids: valid_affiliate_ids_array,
        affiliates: []
      }).then(assured_affiliates => {
        expect(assured_affiliates.length).to.equal(1);
        expect(assured_affiliates[0].affiliate_id).to.equal(valid_affiliate_ids_array.shift());
      });

    });

    it('succeeds when able to match affiliates', () => {

      let affiliateHelperController = new AffiliateHelperController();

      let valid_affiliate_ids_array = getValidAffiliateIDsArray();
      let valid_affiliate_object = getValidAffiliateObject();

      return affiliateHelperController.assureAffiliatesArrayTransform({affiliate_ids: valid_affiliate_ids_array, affiliates: [valid_affiliate_object]}).then(assured_affiliates => {
        expect(assured_affiliates).to.deep.equal([valid_affiliate_object]);
      });

    });

  });

  describe('Validate Assure Affiliates Array', () => {

    it('fails when affiliate array is not provided', () => {

      let affiliateHelperController = new AffiliateHelperController();

      try{
        affiliateHelperController.validateAssureAffiliatesArray();
      }catch(error){
        expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
      }

    });

    it('fails when affiliate array is null', () => {

      let affiliateHelperController = new AffiliateHelperController();

      try{
        affiliateHelperController.validateAssureAffiliatesArray(null);
      }catch(error){
        expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
      }

    });

    it('fails when affiliate array is an empty object', () => {

      let affiliateHelperController = new AffiliateHelperController();

      try{
        affiliateHelperController.validateAssureAffiliatesArray({});
      }catch(error){
        expect(error.message).to.equal('[500] ArrayUtilities.isArray thing argument is not an array.');
      }

    });

    it('fails when affiliate array is empty', () => {

      let affiliateHelperController = new AffiliateHelperController();

      try{
        affiliateHelperController.validateAssureAffiliatesArray([]);
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

      let affiliateHelperController = new AffiliateHelperController();

      arrayutilities.map(bad_arrays, bad_array => {

        try{
          affiliateHelperController.validateAssureAffiliatesArray(bad_array);
        }catch(error){
          expect(error.message).to.equal('[500] affiliateHelperController.assureAffiliates assumes all affiliate ID\'s are strings.');
        }

      });

    });

  });

});
