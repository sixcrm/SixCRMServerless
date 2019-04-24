import * as uuid from 'uuid';
import * as _ from 'lodash';
import * as Bluebird from 'bluebird';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');
chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;
const assert = chai.assert;

import Configuration from '@6crm/sixcrm-platform/lib/config/Configuration';
import IPostgresConfig from '@6crm/sixcrm-data/lib/config/Postgres';

import NotFoundError from '@6crm/sixcrm-platform/lib/errors/NotFoundError';
import NotAuthorizedError from '@6crm/sixcrm-platform/lib/errors/NotAuthorizedError';

import Product from '@6crm/sixcrm-product-setup/lib/models/Product';
import ProductSchedule from '@6crm/sixcrm-product-setup/lib/models/ProductSchedule';
import Cycle from '@6crm/sixcrm-product-setup/lib/models/Cycle';
import CycleProduct from '@6crm/sixcrm-product-setup/lib/models/CycleProduct';

import SubscriptionService from '../src/SubscriptionService';
import Subscription from '../src/models/Subscription';
import SubscriptionCycle from '../src/models/SubscriptionCycle';
import SubscriptionCycleProduct from '../src/models/SubscriptionCycleProduct';
import { createSubscriptionService } from '../src';

import ProductSetupService from '@6crm/sixcrm-product-setup/src/ProductSetupService';
import ProductScheduleService from '@6crm/sixcrm-product-setup/src/ProductScheduleService';
import { createProductSetupService, createProductScheduleService } from '@6crm/sixcrm-product-setup';
import { disconnect } from "@6crm/sixcrm-product-setup/lib/connect";
import { MASTER_ACCOUNT_ID } from '@6crm/sixcrm-data/lib/constants';

const uuidRegex = /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/;

const getValidProductSchedule = (accountId): ProductSchedule => {
	const productSchedule: any = {
		account_id: accountId,
		name: 'Test Product Schedule',
		merchant_provider_group_id: uuid.v4(),
		requires_confirmation: false,
		created_at: new Date(),
		updated_at: new Date()
	};

	productSchedule.cycles = [
		getValidCycle({
			accountId,
			position: 1,
			next_position: 2
		}),
		getValidCycle({
			accountId,
			position: 2,
			next_position: 1
		})
	];

	return productSchedule;
};

const getValidCycle = ({
	accountId,
	position,
	next_position
}: {
	accountId: string,
	position: number,
	next_position: number
}): Cycle => {
	const cycle: any = {
		created_at: new Date(),
		length: '30 days',
		name: 'A cycle',
		next_position,
		position,
		price: 100,
		shipping_price: 0,
		updated_at: new Date()
	};

	cycle.cycle_products = [ getValidCycleProduct(getValidProduct(accountId)) ];

	return cycle;
};

const getValidCycleProduct = (product: Product) => {
	return {
		created_at: new Date(),
		is_shipping: false,
		position: 0,
		product,
		quantity: 1,
		updated_at: new Date()
	};
};

const getValidProduct = (accountId) => {
	return new Product(uuid.v4(), accountId, 'A product', 100, false, []);
};

describe('@6crm/sixcrm-subscriptions/lib/SubscriptionService', () => {

	let subscriptionService: SubscriptionService;
	let anotherSubscriptionService: SubscriptionService;
	let masterSubscriptionService: SubscriptionService;
	let productSetupService: ProductSetupService;
	let productScheduleService: ProductScheduleService;
	const accountId = uuid.v4();
	const anotherAccountId = uuid.v4();

	before(async () => {
		const auroraConfig = await Configuration.get<IPostgresConfig>('aurora');

		subscriptionService = await createSubscriptionService(accountId, auroraConfig);
		anotherSubscriptionService = await createSubscriptionService(anotherAccountId, auroraConfig);
		masterSubscriptionService = await createSubscriptionService(MASTER_ACCOUNT_ID, auroraConfig);
		productSetupService = await createProductSetupService({
			accountId,
			host: auroraConfig.host,
			port: auroraConfig.port,
			username: auroraConfig.user,
			password: auroraConfig.password,
			schema: 'product_setup'
		});
		productScheduleService = await createProductScheduleService({
			accountId,
			host: auroraConfig.host,
			port: auroraConfig.port,
			username: auroraConfig.user,
			password: auroraConfig.password,
			schema: 'product_setup'
		});
	});

	after(async () => {

		await subscriptionService.dispose();
		await anotherSubscriptionService.dispose();
		await masterSubscriptionService.dispose();
		await disconnect(); // fix this so it's similar to subscriptionService

	});

	const createProductSchedule = async () => {

		const partialProductSchedule = getValidProductSchedule(accountId);
		const products = _.uniqBy(
			_.reduce(
				partialProductSchedule.cycles,
				(agg, cycle) => _.concat(agg, _.map(cycle.cycle_products, cycle_product => cycle_product.product)),
				[] as any[]),
			product => product.id);

		await Bluebird.each(products, async product => productSetupService.createProduct(product));
		return productScheduleService.create(partialProductSchedule);

	};

	describe('create', () => {

		it('creates a subscription from a well-formed product schedule', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			expect(subscriptionId).to.match(uuidRegex);

		});

		it('throws NotAuthorizedError when creating in the wrong account', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();

			await expect(anotherSubscriptionService.create(productSchedule, customerId, merchantProviderId)).to.be.rejectedWith(NotAuthorizedError);

		});

	});

	describe('get', () => {

		it('gets a subscription by id', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			expect(subscriptionId).to.match(uuidRegex);

			const subscription = await subscriptionService.get(subscriptionId);
			expect(subscription).to.have.property('name', productSchedule.name);
			expect(subscription).to.have.property('account_id', productSchedule.account_id);
			expect(subscription).to.have.property('customer_id', customerId);
			expect(subscription).to.have.property('merchant_provider_id', merchantProviderId);
			expect(subscription.cycles).to.have.length(productSchedule.cycles.length);

		});

		it('gets a subscription when authorized by the master account', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			const subscription = await masterSubscriptionService.get(subscriptionId);
			expect(subscription.id).to.equal(subscriptionId);

		});

		it('throws NotFoundError for a nonexistent subscription', async () => {

			await expect(subscriptionService.get('00000000-0000-0000-0000-000000000000')).to.be.rejectedWith(NotFoundError);

		});

		it('throws NotAuthorizedError for the wrong account', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			await expect(anotherSubscriptionService.get(subscriptionId)).to.be.rejectedWith(NotAuthorizedError);

		});

	});

	describe('delete', () => {

		it('deletes a subscription by id', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			await subscriptionService.delete(subscriptionId);

			await expect(subscriptionService.get(subscriptionId)).to.be.rejectedWith(NotFoundError);

		});

		it('deletes a subscription when authorized by the master account', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			await subscriptionService.delete(subscriptionId);

			await expect(masterSubscriptionService.get(subscriptionId)).to.be.rejectedWith(NotFoundError);

		});

		it('throws NotFoundError for a nonexistent subscription', async () => {

			await expect(subscriptionService.delete('00000000-0000-0000-0000-000000000000')).to.be.rejectedWith(NotFoundError);

		});

		it('throws NotAuthorizedError for the wrong account', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = await createProductSchedule();
			const subscriptionId = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			await expect(anotherSubscriptionService.delete(subscriptionId)).to.be.rejectedWith(NotAuthorizedError);

		});

	});

});
