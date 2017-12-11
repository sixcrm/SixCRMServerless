'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

const FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');

function getValidProducts(product_ids){

  let products = [];

  if(_.isUndefined(product_ids)){
    product_ids = [uuidV4(), uuidV4()];
  }

  return arrayutilities.map(product_ids, product_id => {
    return {
      id:product_id,
  		name:randomutilities.createRandomString(20),
  		sku:randomutilities.createRandomString(20),
  		ship:true,
      shipping_delay:3600,
  		fulfillment_provider:uuidV4(),
  		default_price:39.99,
  		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
  		created_at:timestamp.getISO8601(),
  		updated_at:timestamp.getISO8601()
    };
  });

}

function getValidFulfillmentProvider(){

  return {
    id:uuidV4(),
		account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
		name: randomutilities.createRandomString(20),
		username: randomutilities.createRandomString(10),
		password: randomutilities.createRandomString(10),
		provider:"HASHTAG",
		created_at: timestamp.getISO8601(),
		updated_at:timestamp.getISO8601()
  };

}

describe('helpers/shipment/Fulfill.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      let FulfillController = global.SixCRM.routes.include('helpers', 'shipment/Fulfill.js');
      let fulfillController = new FulfillController();

      expect(objectutilities.getClassName(fulfillController)).to.equal('FulfillController');
    });

  });

  xdescribe('hydrateRequestProperties', () => {
    it('', () => {
      //Complete
    });
  });

  xdescribe('execute', () => {
    it('', () => {
      //Complete
    });
  });

  xdescribe('hydrateAugmentedTransactionProducts', () => {
    it('', () => {
      //Complete
    });
  });

  xdescribe('executeFulfillment', () => {
    it('', () => {
      //Complete
    });
  });

});
