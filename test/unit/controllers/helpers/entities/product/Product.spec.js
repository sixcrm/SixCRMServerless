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

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let ProductHelperController = global.SixCRM.routes.include('helpers', 'entities/product/Product.js');

describe('helpers/entites/product/Product.js', () => {

  describe('constructor', () => {

    it('successfully constructs', () => {

      let productHelperController = new ProductHelperController();

      expect(objectutilities.getClassName(productHelperController)).to.equal('ProductHelperController');
    });

  });

  describe('getDistributionBySKU', () => {

    it('successfully returns a distribution by SKU', () => {

      let products = []
      let product_one_count = randomutilities.randomInt(1,100);
      let product_one_sku = randomutilities.createRandomString(20);

      let product_two_count = randomutilities.randomInt(1,100);
      let product_two_sku = randomutilities.createRandomString(20);

      let product_three_count = randomutilities.randomInt(1,100);
      let product_three_sku = randomutilities.createRandomString(20);

      for(var i=0; i<product_one_count; i++){
        products.push({sku: product_one_sku});
      }

      for(var j=0; j<product_two_count; j++){
        products.push({sku: product_two_sku});
      }

      for(var k=0; k<product_three_count; k++){
        products.push({sku: product_three_sku});
      }

      let productHelperController = new ProductHelperController();
      let distribution = productHelperController.getDistributionBySKU({products: products});

      expect(products.length).to.equal((product_one_count + product_two_count + product_three_count));
      expect(distribution[product_one_sku]).to.equal(product_one_count);
      expect(distribution[product_two_sku]).to.equal(product_two_count);
      expect(distribution[product_three_sku]).to.equal(product_three_count);

    });

  });

});
