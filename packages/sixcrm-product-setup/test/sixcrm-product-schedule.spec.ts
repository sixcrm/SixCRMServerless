'use strict';

import { v4 } from 'uuid';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

import {createProductScheduleService} from '../src';
import {disconnect} from "../src/connect";
import ProductScheduleService from "../src/ProductScheduleService";

let getValidProductSchedule = function(accountId) {
	return {id: '123'};
};

describe('@6crm/sixcrm-product-schedule', () => {
	let productScheduleService: ProductScheduleService;
	let accountId = v4();

	before(async () => {
        console.error('Start create PS service');
		productScheduleService = await createProductScheduleService({
			accountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public',
			logging: ['error']
		});
        console.error('End create PS service');
	});

	after(async () => {
        console.error('Start disconect PS service');
		await disconnect();
        console.error('End disconect PS service');
	});

	describe('createProductSchedule', () => {
		it('creates a product in the account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await productScheduleService.create(aProductSchedule);

			// when
			const productFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(productFromDb.id).to.equal(aProductSchedule.id);
		});


	});
});
