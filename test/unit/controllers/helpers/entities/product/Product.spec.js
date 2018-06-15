

const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;
const mathutilities = require('@sixcrm/sixcrmcore/util/math-utilities').default;
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

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
