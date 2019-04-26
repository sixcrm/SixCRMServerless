'use strict';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');
import ProductSchedule from "../../src/models/ProductSchedule";
import Cycle from "../../src/models/Cycle";
import CycleProduct from "../../src/models/CycleProduct";
import v4 = require("uuid/v4");

chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;



describe('@6crm/sixcrm-product-setup/models/ProductSchedule', () => {

	describe('validate', () => {
		it('ProductSchedule requires a name', async () => {
			expect(() => new ProductSchedule('id', 'account', '', false).validate()).to.throw()
		});

		it('ProductSchedule requires a merchant_provider_group_id', async () => {
			const productSchedule = new ProductSchedule('id', 'account', 'Potato Schedule', false);

			expect(() => productSchedule.validate()).to.throw()
		});

		it('ProductSchedule requires cycles', async () => {
			const productSchedule = new ProductSchedule('id', 'account', 'Potato Schedule', false);
			productSchedule.merchant_provider_group_id = v4();

			expect(() => productSchedule.validate()).to.throw()
		});

	});

	describe('currentCycle', () => {
		let twoCycleNoRepeatProductSchedule;
		beforeEach(() => {
			const accountId = 'e5a07d54-2acb-43de-acf2-e3f5bf5d2537';
			twoCycleNoRepeatProductSchedule = new ProductSchedule(
				'96b5524a-993e-46c7-9c58-f08a13fa1533',
				accountId,
				'Test Product Schedule',
				false
			);
			twoCycleNoRepeatProductSchedule.cycles = [
				{
					created_at: new Date(),
					length: '30 days',
					position: 1,
					next_position: 2,
					price: 100,
					shipping_price: 0,
					updated_at: new Date(),
					cycle_products: [{
						created_at: new Date(),
						is_shipping: false,
						position: 0,
						product: { id: '0ff658ac-81c8-4459-b1a0-4cfb5fc5ab32' },
						quantity: 1,
						updated_at: new Date()
					}]
				}, {
					created_at: new Date(),
					length: '30 days',
					name: 'A cycle',
					position: 2,
					price: 100,
					shipping_price: 0,
					updated_at: new Date(),
					cycle_products: [{
						created_at: new Date(),
						is_shipping: false,
						position: 0,
						product: { id: '0ff658ac-81c8-4459-b1a0-4cfb5fc5ab32' },
						quantity: 1,
						updated_at: new Date()
					}]
				}
			];
		});

		it('returns the first cycle for cycle 1 of a two cycle product schedule', () => {
			expect(twoCycleNoRepeatProductSchedule.currentCycle(1)).to.equal(
				twoCycleNoRepeatProductSchedule.cycles[0]
			);
		});

		it('returns the second cycle for cycle 2 of a two cycle product schedule', () => {
			expect(twoCycleNoRepeatProductSchedule.currentCycle(2)).to.equal(
				twoCycleNoRepeatProductSchedule.cycles[1]
			);
		});

		it('returns null for cycle 3 of a two cycle product schedule', () => {
			expect(twoCycleNoRepeatProductSchedule.currentCycle(3)).to.equal(undefined);
		});

		//TODO test for repeating cycles
	});

});
