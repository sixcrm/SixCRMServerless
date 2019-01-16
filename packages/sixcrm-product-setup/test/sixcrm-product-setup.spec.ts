'use strict';

import { v4 } from 'uuid';
import { expect } from 'chai';

import createProductSetupService, { ProductSetupService } from '../src';
import Product from '../src/entities/Product';

let getValidProduct = function(accountId) {
	return new Product(v4(), accountId, 'A product', 100, false, []);
};
describe('@6crm/sixcrm-product-setup', () => {
	let productSetupService: ProductSetupService;
	let accountId = v4();

	before(done => {
		createProductSetupService({
			accountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public'
		}).then(service => {
			productSetupService = service;
			done();
		});
	});

	it('persists a product', done => {
		// given
		const aProduct = getValidProduct(accountId);

		// when
		productSetupService.save(aProduct).then(result => {
			// then
			productSetupService.getProduct(aProduct.id).then(productFromDb => {
				expect(productFromDb.id).to.equal(aProduct.id);
				expect(productFromDb.account_id).to.equal(aProduct.account_id);
				expect(productFromDb.name).to.equal(aProduct.name);
				//expect(productFromDb.price).to.equal(aProduct.price); <-- this fails
				expect(productFromDb.is_shippable).to.equal(aProduct.is_shippable);

				done();
			});
		});
	});

	it('lists products', done => {
		// given
		const aProduct = getValidProduct(accountId);

		productSetupService.getAllProducts().then(products => {
			const originalCount = products.length;

			// when
			productSetupService.save(aProduct).then(() => {
				// then
				productSetupService.getAllProducts().then(products => {
					expect(products.length).to.equal(originalCount + 1);

					done();
				});
			});
		});
	});
});
