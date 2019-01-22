'use strict';

import { v4 } from 'uuid';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import { createProductSetupService } from '../src';
import ProductSetupService from '../src/ProductSetupService';
import Product from '../src/models/Product';

let getValidProduct = function(accountId) {
	return new Product(v4(), accountId, 'A product', 100, false, []);
};

describe('@6crm/sixcrm-product-setup', () => {
	let productSetupService: ProductSetupService;
	let anotherProductSetupService: ProductSetupService;
	let accountId = v4();
	let anotherAccountId = v4();

	before(async () => {
		productSetupService = await createProductSetupService({
			accountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public'
		});

		anotherProductSetupService = await createProductSetupService({
			accountId: anotherAccountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public'
		});
	});

	describe('createProduct', () => {
		it('creates a product', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			await productSetupService.createProduct(aProduct);

			// when
			const productFromDb = await productSetupService.getProduct(aProduct.id);

			// then
			expect(productFromDb.id).to.equal(aProduct.id);
			expect(productFromDb.account_id).to.equal(aProduct.account_id);
			expect(productFromDb.name).to.equal(aProduct.name);
			// expect(productFromDb.price).to.equal(aProduct.price); // this fails cause string conversion
			expect(productFromDb.is_shippable).to.equal(aProduct.is_shippable);
		});

		it('rejects objects with invalid account id', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			aProduct.account_id = 'not-an-uuid';

			// then
			expect(productSetupService.createProduct(aProduct)).to.be.rejected;
		});

		it('rejects objects without account id', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			delete aProduct.account_id;

			// then
			expect(productSetupService.createProduct(aProduct)).to.be.rejected;
		});

		it('rejects objects with negative price', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			aProduct.price = -1;

			// then
			expect(productSetupService.createProduct(aProduct)).to.be.rejected;
		});

		it('rejects objects with duplicate images', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			aProduct.image_urls = ['http://example.com/img.jpg', 'http://example.com/img.jpg'];

			// then
			expect(productSetupService.createProduct(aProduct)).to.be.rejected;
		});
	});

	describe('updateProduct', () => {
		it('enforces same account', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			aProduct.account_id = v4(); // altering the account

			// then
			expect(productSetupService.updateProduct(aProduct)).to.be.rejected;
		});
	});

	describe('getAllProducts', () => {
		it('lists products', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			const previousProducts = await productSetupService.getAllProducts();

			// when
			await productSetupService.createProduct(aProduct);

			// then
			const newProducts = await productSetupService.getAllProducts();
			expect(newProducts.length).to.equal(previousProducts.length + 1);
		});

		it('does not list products from other accounts', async () => {
			// given
			const myProduct = getValidProduct(accountId);
			const someoneElsesProduct = getValidProduct(anotherAccountId);

			productSetupService.createProduct(myProduct);
			anotherProductSetupService.createProduct(someoneElsesProduct);

			// when
			const myProducts = await productSetupService.getAllProducts();

			// then
			expect(
				myProducts.filter(product => product.account_id !== accountId)
			).to.have.lengthOf(0);
		});
	});

	describe('getProductsByIds', () => {
		it('retrieves products', async () => {
			// given
			const firstProduct = getValidProduct(accountId);
			const secondProduct = getValidProduct(accountId);

			await productSetupService.createProduct(firstProduct);
			await productSetupService.createProduct(secondProduct);

			// when
			const products = await productSetupService.getProductsByIds([
				firstProduct.id,
				secondProduct.id
			]);

			// then
			expect(products.map(p => p.id)).to.have.members([
				firstProduct.id,
				secondProduct.id
			]);
		});

		it('retrieves only products from same account', async () => {
			// given
			const firstProduct = getValidProduct(accountId);
			const secondProduct = getValidProduct(anotherAccountId);

			await productSetupService.createProduct(firstProduct);
			await anotherProductSetupService.createProduct(secondProduct);

			// when
			const products = await productSetupService.getProductsByIds([
				firstProduct.id,
				secondProduct.id
			]);

			// then
			expect(products.map(p => p.id)).to.deep.equal([firstProduct.id]);
		});
	});
});
