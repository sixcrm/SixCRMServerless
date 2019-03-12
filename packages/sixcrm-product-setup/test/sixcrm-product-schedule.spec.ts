'use strict';

import { v4 } from 'uuid';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');

chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;
const assert = chai.assert;

import {createProductScheduleService, createProductSetupService} from '../src';
import {disconnect} from "../src/connect";
import ProductScheduleService from "../src/ProductScheduleService";
import ProductSchedule from "../src/models/ProductSchedule";
import Cycle from "../src/models/Cycle";
import NormalizedProductSchedule from "./models/NormalizedProductSchedule";
import CycleProduct from "../src/models/CycleProduct";
import Product from "../src/models/Product";
import ProductSetupService from "../src/ProductSetupService";
import NormalizedProduct from "./models/NormalizedProduct";

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

	productSchedule.cycles = [
		getValidCycle({
			productSchedule,
			accountId,
			position: 1,
			next_position: 2
		}),
		getValidCycle({
			productSchedule,
			accountId,
			position: 2,
			next_position: 1
		})
	];

	return productSchedule;
};

const getValidCycle = ({
	productSchedule,
	accountId,
	position,
	next_position
}: {
	productSchedule: ProductSchedule,
	accountId: string,
	position: number,
	next_position: number
}): Cycle => {
	const cycle: any = {
		id: v4(),
		product_schedule: Object.assign({}, productSchedule),
		created_at: new Date(),
		length: '30 days',
		name: 'A cycle',
		next_position,
		position,
		price: 100,
		shipping_price: 0,
		updated_at: new Date()
	};

	cycle.cycle_products = [ getValidCycleProduct(cycle, getValidProduct(accountId)) ];

	return cycle;
};

const getValidCycleProduct = (cycle: Cycle, product: Product): CycleProduct => {
	return {
		created_at: new Date(),
		cycle: Object.assign({}, cycle),
		is_shipping: false,
		position: 0,
		product,
		quantity: 1,
		updated_at: new Date()
	}
};

const getValidProduct = (accountId) => {
	return new Product(v4(), accountId, 'A product', 100, false, []);
};

describe('@6crm/sixcrm-product-schedule', () => {
	let productScheduleService: ProductScheduleService;
	let anotherAccountProductScheduleService: ProductScheduleService;
	let masterAccountProductScheduleService: ProductScheduleService;
	let masterAccountProductSetupService: ProductSetupService;
	let accountId = v4();
	let anotherAccountId = v4();

	before(async () => {
		productScheduleService = await createProductScheduleService({
			accountId,
			host: 'localhost',
			username: 'postgres',
			password: '',
			schema: 'public',
		});

		anotherAccountProductScheduleService = await createProductScheduleService({
			accountId: anotherAccountId,
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

		masterAccountProductSetupService = await createProductSetupService({
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

	const createProductsForCycles = async ({ account_id, cycles }) => {
		for (const cycle of cycles) {
			for (const cycle_product of cycle.cycle_products) {
				await masterAccountProductSetupService.createProduct({
					...cycle_product.product,
					account_id
				});
			}
		}
	};

	describe('create', () => {
		it('creates a product schedule in the account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);

			// assure all cycle point to existing product
			await createProductsForCycles(aProductSchedule);

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

			// assure all cycle point to existing product
			await createProductsForCycles(aProductSchedule);
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

			// assure all cycle point to existing product
			await createProductsForCycles(aProductSchedule);

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

	describe('update', () => {
		it('updates a product schedule in the account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);
			aProductSchedule.requires_confirmation = !aProductSchedule.requires_confirmation;

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('enforces product schedule must exist', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);

			// then
			await expect(anotherAccountProductScheduleService.update(aProductSchedule)).to.be.rejected;
		});

		it('enforces same account', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			delete aProductSchedule.account_id;
			aProductSchedule.name = 'Random name';

			// then
			await expect(anotherAccountProductScheduleService.update(aProductSchedule)).to.be.rejected;
		});

		it('removes a cycle from the schedule', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			aProductSchedule.cycles.pop(); // remove one cycle;

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('adds a new cycle to schedule', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			// add one cycle
			const newCycle = JSON.parse(JSON.stringify(aProductSchedule.cycles[1]));
			newCycle.id = v4();
			newCycle.position = aProductSchedule.cycles[1].next_position = 3;
			// unfortunately we need to update it from the both sides or relation
			// it should be handled by the domain object anyway
			newCycle.cycle_products[0].cycle.id = newCycle.id;
			aProductSchedule.cycles.push(newCycle);

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('updates a cycle in product schedule', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			aProductSchedule.cycles[0].length = '1 months';

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('updates a cycle_product in cycle schedule', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			aProductSchedule.cycles[0].cycle_products[0].is_shipping = !aProductSchedule.cycles[0].cycle_products[0].is_shipping;

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('adds a new product to cycle', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			// create a new cycle product
			const newCp = JSON.parse(JSON.stringify(aProductSchedule.cycles[0].cycle_products[0]));
			newCp.product = getValidProduct(accountId);
			aProductSchedule.cycles[0].cycle_products.push(newCp);
			await masterAccountProductSetupService.createProduct({
				...newCp.product,
				account_id: accountId
			});

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			expect(NormalizedProductSchedule.of(productScheduleFromDb))
				.to.deep.equal(NormalizedProductSchedule.of(aProductSchedule))
		});

		it('does not persist changes to product in cycle_product', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			const originalName = aProductSchedule.cycles[0].cycle_products[0].product.name;
			aProductSchedule.cycles[0].cycle_products[0].product.name = 'potato';

			// when
			await productScheduleService.update(aProductSchedule);
			const productScheduleFromDb = await productScheduleService.get(aProductSchedule.id);

			// then
			assert.deepEqualExcluding(
				NormalizedProductSchedule.of(productScheduleFromDb),
				NormalizedProductSchedule.of(aProductSchedule),
				'cycles'
			);

			assert.deepEqualExcluding(
				NormalizedProduct.of(aProductSchedule.cycles[0].cycle_products[0].product),
				NormalizedProduct.of(productScheduleFromDb.cycles[0].cycle_products[0].product),
				'name'
			);

			expect(productScheduleFromDb.cycles[0].cycle_products[0].product.name).to.equal(originalName);
		});
	});

	describe('getAll', () => {
		it('lists products', async () => {
			// given
			const aProductSchedule = getValidProductSchedule(accountId);
			const previousProductSchedules = await productScheduleService.getAll();

			await createProductsForCycles(aProductSchedule);
			await productScheduleService.create(aProductSchedule);

			// when
			const newProductSchedules = await productScheduleService.getAll();

			// then
			expect(newProductSchedules.length).to.equal(previousProductSchedules.length + 1);
		});

		it('does not list products from other accounts', async () => {
			// given
			const myProductSchedule = getValidProductSchedule(accountId);
			const anotherAccountProductSchedule = getValidProductSchedule(anotherAccountId);

			await createProductsForCycles(myProductSchedule);
			await productScheduleService.create(myProductSchedule);

			await createProductsForCycles(anotherAccountProductSchedule);
			await masterAccountProductScheduleService.create(anotherAccountProductSchedule);

			// when
			const myProductSchedules = await productScheduleService.getAll();


			// then
			expect(
				myProductSchedules.filter(productSchedule => productSchedule.account_id !== accountId)
			).to.have.lengthOf(0);
		});
	});
});
