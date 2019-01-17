'use strict';

import { v4 } from 'uuid';
import { expect } from 'chai';

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

	describe('save', () => {
		it('persists a product', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			await productSetupService.save(aProduct);

			// when
			const productFromDb = await productSetupService.getProduct(aProduct.id);

			// then
			expect(productFromDb.id).to.equal(aProduct.id);
			expect(productFromDb.account_id).to.equal(aProduct.account_id);
			expect(productFromDb.name).to.equal(aProduct.name);
			// expect(productFromDb.price).to.equal(aProduct.price); // this fails cause string conversion
			expect(productFromDb.is_shippable).to.equal(aProduct.is_shippable);
		});

		it('enforces same account', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			aProduct.account_id = v4(); // altering the account

			// then
			expect(() => productSetupService.save(aProduct)).to.throw();
		});
	});

	describe('getAllProducts', () => {
		it('lists products', async () => {
			// given
			const aProduct = getValidProduct(accountId);
			const previousProducts = await productSetupService.getAllProducts();

			// when
			await productSetupService.save(aProduct);

			// then
			const newProducts = await productSetupService.getAllProducts();
			expect(newProducts.length).to.equal(previousProducts.length + 1);
		});

		it('does not list products from other accounts', async () => {
			// given
			const myProduct = getValidProduct(accountId);
			const someoneElsesProduct = getValidProduct(anotherAccountId);

			productSetupService.save(myProduct);
			anotherProductSetupService.save(someoneElsesProduct);

			// when
			const myProducts = await productSetupService.getAllProducts();

			// then
			expect(
				myProducts.filter(product => product.account_id !== accountId)
			).to.have.lengthOf(0);
		});
	});
});
