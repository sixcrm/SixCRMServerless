'use strict';

import { v4 } from 'uuid';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');

chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;

import {createProductScheduleService} from '../src';
import {disconnect} from "../src/connect";
import ProductScheduleService from "../src/ProductScheduleService";
import ProductSchedule from "../src/models/ProductSchedule";
import Cycle from "../src/models/Cycle";

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
	let accountId = v4();

	before(async () => {
		productScheduleService = await createProductScheduleService({
			accountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public',
		});
	});

	after(async () => {
		await disconnect();
	});

	describe('createProductSchedule', () => {
		it('creates a product schedule in the account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			const id = (await productScheduleService.create(aProductSchedule)).id;

			// when
			const productScheduleFromDb = await productScheduleService.get(id);

			// then
			expect(productScheduleFromDb.cycles.length).to.equal(aProductSchedule.cycles.length);
			expect(productScheduleFromDb.id).to.equal(aProductSchedule.id);
			expect(productScheduleFromDb.name).to.equal(aProductSchedule.name);
			// expect(productScheduleFromDb).excluding(['updated_at', 'cycles', 'created_at']).to.equal(aProductSchedule);
		});


	});
});
