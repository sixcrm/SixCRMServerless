import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { v4 } from 'uuid';
import Product from '../../../src/models/Product';
import LegacyProduct from "../../../src/models/legacy/LegacyProduct";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('@6crm/sixcrm-product-setup/models/legacy/LegacyProduct', () => {
	describe('fromProduct', () => {
		it('should transform all required fields', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, []);
			const {
				account_id,
				created_at,
				image_urls,
				is_shippable,
				price,
				sku,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				...commonProductFields,
				account: account_id,
				attributes: {
					images: []
				},
				created_at: created_at.toISOString(),
				default_price: price,
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				ship: is_shippable,
				shipping_delay: 0,
				updated_at: updated_at.toISOString(),
			});
		});

		it('should transform nullable fields', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, []);
			product.description = product.sku = product.shipping_price = product.shipping_delay = null;
			const {
				account_id,
				created_at,
				image_urls,
				is_shippable,
				price,
				sku,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				...commonProductFields,
				account: account_id,
				attributes: {
					images: []
				},
				created_at: created_at.toISOString(),
				default_price: price,
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				ship: is_shippable,
				shipping_delay: 0,
				updated_at: updated_at.toISOString(),
			});
		});

		it('should transform a product with images', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, ['http://default/image', 'http//image2']);
			const {
				account_id,
				created_at,
				image_urls: [defaultImageURL, imageURL2],
				is_shippable,
				price,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				account: account_id,
				attributes: {
					images: [{
						default_image: true,
						path: defaultImageURL
					}, {
						default_image: false,
						path: imageURL2
					}]
				},
				created_at: created_at.toISOString(),
				default_price: price,
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				ship: is_shippable,
				shipping_delay: 0,
				updated_at: updated_at.toISOString(),
				...commonProductFields
			});
		});

		it('should transform a product with a shipping price', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, []);
			product.shipping_price = 2;
			const {
				account_id,
				created_at,
				image_urls,
				is_shippable,
				price,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				account: account_id,
				attributes: {
					images: []
				},
				created_at: created_at.toISOString(),
				default_price: Number(price) + Number(shipping_price),
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				ship: is_shippable,
				shipping_delay: 0,
				updated_at: updated_at.toISOString(),
				...commonProductFields
			});
		});

		it('should transform a product with a shipping delay', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, []);
			product.shipping_delay = { hours: 1, minutes: 1, seconds: 1 };
			const {
				account_id,
				created_at,
				image_urls,
				is_shippable,
				price,
				shipping_delay,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				account: account_id,
				attributes: {
					images: []
				},
				created_at: created_at.toISOString(),
				default_price: price,
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				ship: is_shippable,
				shipping_delay: 60*60 + 60 + 1,
				updated_at: updated_at.toISOString(),
				...commonProductFields
			});
		});

		it('should transform a product with a merchant provider group ID', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, []);
			product.merchant_provider_group_id = v4();
			const {
				account_id,
				created_at,
				image_urls,
				is_shippable,
				merchant_provider_group_id,
				price,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				account: account_id,
				attributes: {
					images: []
				},
				created_at: created_at.toISOString(),
				default_price: price,
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				merchantprovidergroup: merchant_provider_group_id,
				ship: is_shippable,
				shipping_delay: 0,
				updated_at: updated_at.toISOString(),
				...commonProductFields
			});
		});

		it('should transform a product with a fulfillment provider ID', () => {
			const product = new Product(v4(), v4(), 'A product', 100, false, []);
			product.fulfillment_provider_id = v4();
			const {
				account_id,
				created_at,
				fulfillment_provider_id,
				image_urls,
				is_shippable,
				price,
				shipping_price,
				updated_at,
				...commonProductFields
			} = product;

			const legacyProduct = LegacyProduct.fromProduct(product);

			expect(legacyProduct).to.deep.equal({
				account: account_id,
				attributes: {
					images: []
				},
				created_at: created_at.toISOString(),
				default_price: price,
				description: '',
				dynamic_pricing: {
					max: 9999999,
					min: 0
				},
				fulfillment_provider: fulfillment_provider_id,
				ship: is_shippable,
				shipping_delay: 0,
				updated_at: updated_at.toISOString(),
				...commonProductFields
			});
		});
	});

	describe('toProduct', () => {
		it('should transform to Product', () => {
			const legacyProduct = new LegacyProduct(
				v4(), [], new Date().toISOString(), 100, 'abc', 0,
				v4(), v4(), v4(), 'A Product', true, 0, 123, new Date().toISOString());

			const product = legacyProduct.toProduct();

			expect(product.id).to.equal(legacyProduct.id);
			expect(product.account_id).to.equal(legacyProduct.account);
			expect(product.created_at.toISOString()).to.equal(legacyProduct.created_at);
			expect(product.updated_at.toISOString()).to.equal(legacyProduct.updated_at);

		});
	});
});
