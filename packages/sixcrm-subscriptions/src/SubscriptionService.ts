import { Connection, Repository, FindConditions } from 'typeorm';
import { validate, ValidationError } from "class-validator";
import { merge } from 'lodash';
import { LogMethod, logger } from "@6crm/sixcrm-platform/lib/log";
import Subscription from "./models/Subscription";
import SubscriptionCycle from './models/SubscriptionCycle';
import SubscriptionCycleProduct from "./models/SubscriptionCycleProduct";
import ProductSchedule from '@6crm/sixcrm-product-setup/lib/models/ProductSchedule';

import { MASTER_ACCOUNT_ID } from '@6crm/sixcrm-data/lib/constants';

const log = logger('ProductScheduleService');


interface ISubscriptionEntityId {
	id: string;
}

export default class SubscriptionService {

	private readonly subscriptionRepository: Repository<Subscription>;
	private readonly accountId: string;
	private readonly baseFindConditions: any;
	private readonly connection: Connection;

	constructor({
		accountId,
		connection
	}: {
		accountId: string;
		connection: Connection;
	}) {
		this.connection = connection;
		this.subscriptionRepository = connection.getRepository(Subscription);
		this.accountId = accountId;

		const whereCondition = accountId === MASTER_ACCOUNT_ID ? {} : { where: { account_id: accountId } };
		this.baseFindConditions = {
			...whereCondition,
			relations: ['cycles', 'cycles.cycle_products', 'cycles.cycle_products.product']
		};
	}

	@LogMethod()
	get(id: string): Promise<Subscription> {
		return this.subscriptionRepository.findOneOrFail(
			merge({}, this.baseFindConditions, { where: { id } })
		);
	}

	@LogMethod()
	getAll(limit?: number): Promise<Subscription[]> {
		return this.subscriptionRepository.find({
			...this.baseFindConditions,
			take: limit
		});
	}

	@LogMethod()
	find(conditions: FindConditions<Subscription>): Promise<Subscription[]> {
		return this.subscriptionRepository.find(
			merge({}, this.baseFindConditions, { where: conditions })
		);
	}

	@LogMethod()
	getByIds(ids: string[]): Promise<Subscription[]> {
		return this.subscriptionRepository.findByIds(ids, this.baseFindConditions);
	}

	// @LogMethod()
	// getByProductId(productId: string): Promise<Subscription[]> {
	// 	return this.subscriptionRepository.createQueryBuilder('subscription')
	// 		.innerJoinAndSelect('subscription.cycles', 'cycle')
	// 		.innerJoinAndSelect('cycle.cycle_products', 'cycle_product')
	// 		.innerJoinAndSelect('cycle_product.product', 'product')
	// 		.where('cycle_product.product_id = :productId', { productId })
	// 		.getMany();
	// }

	@LogMethod()
	async create(partialProductSchedule: Partial<ProductSchedule>, customer_id: string): Promise<ProductSchedule> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const subscription: Subscription = this.subscriptionRepository.create({
			account_id: this.accountId,
			customer_id,
			...partialProductSchedule
		}).validated();

		await this.validateCreateSubscription(subscription);

		let saved;
		await this.connection.transaction(async manager => {
			saved = await manager.save(subscription);
			for (const cycle of subscription.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager
						.createQueryBuilder()
						.relation(SubscriptionCycle, 'cycle_products')
						.of(cycle)
						.add({ cycle, product: cycle_product });
				}
			}
		});

		return saved;
	}

	@LogMethod()
	async update(partialSubscription: Partial<Subscription>): Promise<void> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const subscription = this.subscriptionRepository.create({
			account_id: this.accountId,
			...partialSubscription
		}).validated();
		if (this.isMasterAccount()) {
			delete subscription.account_id;
		}
		// remove updated_at to workaround https://github.com/typeorm/typeorm/issues/2651
		delete subscription.updated_at;

		const { id } = subscription;
		let previous: Subscription;
		try {
			previous = await this.get(id);
		} catch (e) {
			log.error('No subscription found in account', e);
			throw new Error('No subscription found in account');
		}
		await this.validateSubscription(subscription, previous);

		let saved;
		await this.connection.transaction(async manager => {
			saved = await manager.save(subscription);
			for (const cycle of subscription.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager
						.createQueryBuilder()
						.relation(SubscriptionCycle, 'cycle_products')
						.of(cycle)
						.add({ cycle, product: cycle_product });
				}
			}
		});

		return saved;
	}

	@LogMethod()
	async delete(id: string): Promise<ISubscriptionEntityId> {
		const subscription = await this.get(id);

		await this.connection.transaction(async manager => {
			for (const cycle of subscription.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager.delete(SubscriptionCycleProduct, {cycle, product: cycle_product.product});
				}
				await manager.delete(SubscriptionCycle, cycle.id);
			}
			await manager.delete(Subscription, id);
		});

		return  { id };
	}

	@LogMethod('debug')
	private canUpdate(subscriptionAccountId: string, previousAccountId: string | null): boolean {
		return (
			this.isMasterAccount() ||
			(!!subscriptionAccountId &&
				subscriptionAccountId === this.accountId &&
				(!previousAccountId || previousAccountId === this.accountId))
		);
	}

	@LogMethod('debug')
	private isMasterAccount(): boolean {
		return this.accountId === MASTER_ACCOUNT_ID;
	}

	private async validateCreateSubscription(subscription: Subscription): Promise<void> {
		const { account_id } = subscription;
		if (account_id === MASTER_ACCOUNT_ID) {
			throw new Error('Subscriptions cannot be created on the Master account');
		}
		return this.validateSubscription(subscription);
	}

	@LogMethod('debug')
	private async validateSubscription(subscription: Subscription, previous?: Subscription): Promise<void> {
		const { account_id } = subscription;
		const previousAccountId = previous ? previous.account_id : null;
		if (!this.canUpdate(account_id, previousAccountId)) {
			throw new Error('Not authorized to save subscription');
		}
		const errors: ValidationError[] = await validate(subscription);
		const valid: boolean = !errors.length;
		if (!valid) {
			throw new Error(errors[0].toString());
		}
	}

}
