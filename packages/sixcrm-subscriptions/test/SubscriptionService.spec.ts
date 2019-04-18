import * as uuid from 'uuid';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import chaiExclude = require('chai-exclude');
chai.use(chaiAsPromised);
chai.use(chaiExclude);
const expect = chai.expect;
const assert = chai.assert;

import Configuration from '@6crm/sixcrm-platform/lib/config/Configuration';
import IPostgresConfig from '@6crm/sixcrm-data/lib/config/Postgres';

import Product from '@6crm/sixcrm-product-setup/lib/models/Product';
import ProductSchedule from '@6crm/sixcrm-product-setup/lib/models/ProductSchedule';
import Cycle from '@6crm/sixcrm-product-setup/lib/models/Cycle';
import CycleProduct from '@6crm/sixcrm-product-setup/lib/models/CycleProduct';

import SubscriptionService from '../src/SubscriptionService';
import Subscription from '../src/models/Subscription';
import SubscriptionCycle from '../src/models/SubscriptionCycle';
import SubscriptionCycleProduct from '../src/models/SubscriptionCycleProduct';

import { createSubscriptionService } from '../src';

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
	const accountId = uuid.v4();

	before(async () => {
		const auroraConfig = await Configuration.get<IPostgresConfig>('aurora');

		subscriptionService = await createSubscriptionService(accountId, auroraConfig);
	});

	after(async () => {

		return subscriptionService.dispose();

	});

	describe('create', () => {

		it('creates a subscription from a well-formed product schedule', async () => {

			const customerId = uuid.v4();
			const merchantProviderId = uuid.v4();
			const productSchedule = getValidProductSchedule(accountId);

			const subscription = await subscriptionService.create(productSchedule, customerId, merchantProviderId);

			expect(subscription).to.be.an.instanceOf('string');

		});

	});

});
