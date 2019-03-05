'use strict';

import { v4 } from 'uuid';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');

chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;
const assert = chai.assert;

import {createProductScheduleService} from '../src';
import {disconnect} from "../src/connect";
import ProductScheduleService from "../src/ProductScheduleService";
import ProductSchedule from "../src/models/ProductSchedule";
import Cycle from "../src/models/Cycle";
import NormalizedProductSchedule from "./models/NormalizedProductSchedule";

const getValidProductSchedule = function(accountId): ProductSchedule {
	const productSchedule: any = {
		id: v4(),
		account_id: accountId,
		name: 'Test Product Schedule',
		merchant_provider_group_id: v4(),
		requires_confirmation: false,
		created_at: new Date(),
		updated_at: new Date()
	};

	productSchedule.cycles = [ getValidCycle(productSchedule), getValidCycle(productSchedule) ];

	return productSchedule;
};

const getValidCycle = (productSchedule: ProductSchedule): Cycle => {
	return {
		id: v4(),
		product_schedule: Object.assign({}, productSchedule),
		created_at: new Date(),
		cycle_products: [],
		is_monthly: false,
		length: 30,
		name: 'A cycle',
		next_position: 1,
		position: 1,
		price: 100,
		shipping_price: 0,
		updated_at: new Date()
	}
};

describe('@6crm/sixcrm-product-schedule', () => {
	let productScheduleService: ProductScheduleService;
	let masterAccountProductScheduleService: ProductScheduleService;
	let accountId = v4();

	before(async () => {
		productScheduleService = await createProductScheduleService({
			accountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public',
		});

		masterAccountProductScheduleService = await createProductScheduleService({
			accountId: '*',
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public',
			logging: ['error']
		});
	});

	after(async () => {
		await disconnect();
	});

	describe('createProductSchedule', () => {
		it('creates a product schedule in the account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			const { id } = (await productScheduleService.create(aProductSchedule));

			// when
			const productScheduleFromDb = await productScheduleService.get(id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('creates a product schedule using the ProductScheduleService account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			delete aProductSchedule.account_id;
			const { id } = (await productScheduleService.create(aProductSchedule));

			// when
			const productScheduleFromDb = await productScheduleService.get(id);

			// then
			expect(productScheduleFromDb.id).to.equal(aProductSchedule.id);
			expect(productScheduleFromDb.name).to.equal(aProductSchedule.name);
			expect(productScheduleFromDb.account_id).to.equal(accountId);

			assert.deepEqualExcluding(
				NormalizedProductSchedule.of(productScheduleFromDb),
				NormalizedProductSchedule.of(aProductSchedule),
				'account_id'
			);
		});

		it('creates a product schedule in an account as the master account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			const { id } = (await masterAccountProductScheduleService.create(aProductSchedule));

			// when
			const productScheduleFromDb = await productScheduleService.get(id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('rejects objects with invalid account id', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			aProductSchedule.account_id = 'not-an-uuid';

			// then
			await expect(productScheduleService.create(aProductSchedule)).to.be.rejected;
		});

		it('rejects objects with empty string account id', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			aProductSchedule.account_id = '';

			// then
			await expect(productScheduleService.create(aProductSchedule)).to.be.rejected;
		});

		it('rejects objects with the master account id', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			aProductSchedule.account_id = '*';

			// then
			await expect(productScheduleService.create(aProductSchedule)).to.be.rejected;
		});
	});
});
