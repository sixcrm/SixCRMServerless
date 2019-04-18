import * as _ from 'lodash';
import { validate, ValidationError } from "class-validator";
import PostgresConnection from '@6crm/sixcrm-data/lib/PostgresConnection';
import NotAuthorizedError from '@6crm/sixcrm-platform/lib/errors/NotAuthorizedError';
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

	private readonly _accountId: string;
	private readonly _connection: PostgresConnection;

	constructor(accountId: string, connection: PostgresConnection) {
		this._connection = connection;
		this._accountId = accountId;
	}

	@LogMethod()
	async get(id: string): Promise<Subscription> {

		const result = await this._connection.query(`
			SELECT
				s.id AS subscription_id, s.account_id, s.customer_id, s.product_schedule_id, s.name as subscription_name,
				s.created_at as subscription_created_at, s.updated_at as subscription_updated_at, s.merchant_provider_id, s.requires_confirmation,
				c.id AS cycle_id, c.name as cycle_name, c.created_at as cycle_created_at, c.updated_at as cycle_updated_at,
				c.length, c.cycle_position, c.next_position, c.price, c.shipping_price,
				cp.created_at as cycle_product_created_at, cp.updated_at AS cycle_product_updated_at,
				cp.quantity, cp.is_shipping, cp.position as cycle_product_position,
				p.id as product_id, p.name AS product_name, p.description, p.sku, p.image_urls
			FROM product_setup.subscription s
			JOIN product_setup.subscription_cycle c on s.id = c.subscription_id
			JOIN product_setup.subscription_cycle_product cp on c.id = cp.subscription_cycle_id
			JOIN product_setup.product p on cp.product_id = p.id
			WHERE s.id = $1`,
			[id]);

		if (!this._validateAccount(result.rows[0].account_id)) {
			throw new NotAuthorizedError();
		}

		const cycles: SubscriptionCycle[] = [];
		_.forIn(_.groupBy(result.rows, row => row.cycle_id), cycleRows => {

			const firstCycleRow = cycleRows[0];
			cycles.push(new SubscriptionCycle(
				firstCycleRow.cycle_id,
				firstCycleRow.cycle_name,
				firstCycleRow.cycle_created_at,
				firstCycleRow.cycle_updated_at,
				firstCycleRow.length,
				firstCycleRow.cycle_position,
				firstCycleRow.next_position,
				firstCycleRow.price,
				firstCycleRow.shipping_price,
				_.map(cycleRows, productRow => new SubscriptionCycleProduct(
					{
						id: productRow.product_id,
						name: productRow.product_name,
						description: productRow.description,
						sku: productRow.sku,
						image_urls: productRow.image_urls
					},
					productRow.cycle_product_created_at,
					productRow.cycle_product_updated_at,
					productRow.quantity,
					productRow.is_shipping,
					productRow.cycle_product_position
				))
			));

		});

		const firstRow = result.rows[0];
		return new Subscription(
			firstRow.subscription_id,
			firstRow.account_id,
			firstRow.customer_id,
			firstRow.product_schedule_id,
			firstRow.subscription_name,
			firstRow.subscription_created_at,
			firstRow.subscription_updated_at,
			firstRow.merchant_provider_id,
			firstRow.requires_confirmation,
			cycles
		);

	}

	@LogMethod()
	async create(productSchedule: ProductSchedule, customerId: string, merchantProviderId: string): Promise<string> {

		if (!this._validateAccount(productSchedule.account_id)) {
			throw new NotAuthorizedError();
		}

		return this._connection.withTransaction(async () => {

			const subscriptionResult = await this._connection.query(`
				INSERT INTO product_setup.subscription
				(account_id, customer_id, product_schedule_id, name, merchant_provider_id, requires_confirmation)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING id`,
				[productSchedule.account_id, customerId, productSchedule.id, productSchedule.name, merchantProviderId, productSchedule.requires_confirmation]);

			const subscriptionId = subscriptionResult.rows[0].id;

			const cycleParams = _.map(productSchedule.cycles, cycle =>
				[subscriptionId, cycle.name, cycle.length, cycle.position, cycle.next_position, cycle.price, cycle.shipping_price]);
			const cycleValues = _.map(cycleParams, (params, i) =>
				'(' + _.map(params, (param, j) => `$${i*params.length + j + 1}`).join(',') + ')')
				.join(',\n');

			const cycleResult = await this._connection.query(`
				INSERT INTO product_setup.subscription_cycle
				(subscription_id, name, length, position, next_position, price, shipping_price) VALUES
				${cycleValues}
				RETURNING id`,
				_.flatten(cycleParams));

			_.each(cycleResult.rows, (row, i) => {
				productSchedule.cycles[i].id = row.id;
			});

			const cycleProductParams = _.flatten(_.map(productSchedule.cycles, cycle =>
				_.map(cycle.cycle_products, cycle_product =>
					[cycle.id, cycle_product.product.id, cycle_product.quantity, cycle_product.is_shipping, cycle_product.position])));
			const cycleProductValues = _.map(cycleProductParams, (params, i) =>
				'(' + _.map(params, (param, j) => `$${i*params.length + j + 1}`).join(',') + ')')
				.join(',\n');

			await this._connection.query(`
				INSERT INTO product_setup.subscription_cycle_product
				(subscription_cycle_id, product_id, quantity, is_shipping, position) VALUES
				${cycleProductValues}`,
				_.flatten(cycleProductParams));

			return subscriptionId;

		});

	}

	@LogMethod()
	async update(partialSubscription: Partial<Subscription>): Promise<void> {

		const existingSubscriptionResult = await this._connection.query(
			`SELECT account_id FROM product_setup.subscription WHERE id = $1`, [partialSubscription.id]);

		if (!this._validateAccount(existingSubscriptionResult.rows[0].account_id)) {
			throw new NotAuthorizedError();
		}

		const errors: ValidationError[] = await validate(partialSubscription);
		if (errors.length > 0) {
			throw new Error(errors[0].toString());
		}

		return this._connection.withTransaction(async () => {

			// Remove cycles and cycle_products for cycles that no longer exist.
			const cycleIds = _.map(partialSubscription.cycles, cycle => cycle.id);
			await this._connection.query(`
				DELETE FROM product_setup.subscription_cycle_product scp USING product_setup.subscription_cycle sc
				WHERE
						scp.subscription_cycle_id = sc.id
					AND sc.id NOT IN $1
					AND sc.subscription_id = $2`,
				[cycleIds, partialSubscription.id]);
			await this._connection.query(`
				DELETE FROM product_setup.subscription_cycle
				WHERE id NOT IN $1 AND subscription_id = $2`,
				[cycleIds, partialSubscription.id]);

			await this._connection.query(`
				UPDATE product_setup.subscription SET
					name = $1,
					updated_at = now(),
					merchant_provider_id = $2
				WHERE id = $3`,
				[partialSubscription.name, partialSubscription.merchant_provider_id, partialSubscription.id]);

			// Filter cycles that need to be inserted vs. updated.
			const newCycles = _.filter(partialSubscription.cycles, cycle => cycle.id === undefined);
			if (newCycles.length > 0) {
				const newCycleParams = _.map(newCycles, cycle =>
					[partialSubscription.id, cycle.name, cycle.length, cycle.position, cycle.next_position, cycle.price, cycle.shipping_price]);
				const newCycleValues = _.map(newCycleParams, (params, i) =>
					'(' + _.map(params, (param, j) => `$${i*params.length + j + 1}`).join(',') + ')')
					.join(',\n');
				const cycleResult = await this._connection.query(`
					INSERT INTO product_setup.subscription_cycle
					(subscription_id, name, length, position, next_position, price, shipping_price) VALUES
					${newCycleValues}
					RETURNING id`,
					_.flatten(newCycleParams));
				_.each(cycleResult.rows, (row, i) => {
					newCycles[i].id = row.id;
				});
			}

			const oldCycles = _.filter(partialSubscription.cycles, cycle => cycle.id !== undefined);
			if (oldCycles.length > 0) {
				const oldCycleParams = _.map(oldCycles, cycle =>
					[cycle.id, cycle.name, cycle.length, cycle.position, cycle.next_position, cycle.price, cycle.shipping_price]);
				const oldCycleValues = _.map(oldCycleParams, (params, i) =>
					'(' + _.map(params, (param, j) => `$${i*params.length + j + 1}`).join(',') + ')')
					.join(',\n');
				await this._connection.query(`
					UPDATE product_setup.subscription_cycle sc SET
						name = nc.name,
						updated_at = now(),
						length = nc.length,
						position = nc.position,
						next_position = nc.next_position,
						price = nc.price,
						shipping_price = nc.shipping_price
					FROM (VALUES
					${oldCycleValues}
					) nc (id, name, length, position, next_position, price, shipping_price)
					WHERE sc.id = nc.id`,
					_.flatten(oldCycleParams));
			}

			// Now fix the cycle products, this can be done as an upsert because we don't need to generate ids.
			const cycleProductParams = _.flatten(_.map(partialSubscription.cycles, cycle =>
				_.map(cycle.cycle_products, cycle_product =>
					[cycle.id, cycle_product.product.id, cycle_product.quantity, cycle_product.is_shipping, cycle_product.position])));
			const cycleProductValues = _.map(cycleProductParams, (params, i) =>
				'(' + _.map(params, (param, j) => `$${i*params.length + j + 1}`).join(',') + ')')
				.join(',\n');
			await this._connection.query(`
				INSERT INTO product_setup.subscription_cycle_product
				(subscription_cycle_id, product_id, quantity, is_shipping, position) VALUES
				${cycleProductValues}
				ON CONFLICT(subscription_cycle_id, product_id) DO UPDATE SET
					updated_at = now(),
					quantity = EXCLUDED.quantity,
					is_shipping = EXCLUDED.is_shipping,
					position = EXCLUDED.position`,
				_.flatten(cycleProductParams));

			// Finally, delete cycle products that don't exist in existing cycles.
			const cycleProductIds = _.map(cycleProductParams, params => [params[0], params[1]]);
			const cycleProductIdValues = _.map(cycleProductIds, (params, i) =>
				'(' + _.map(params, (param, j) => `$${i*params.length + j + 1}`).join(',') + ')')
				.join(',\n');
			await this._connection.query(`
				DELETE FROM product_setup.subscription_cycle_product scp
				USING (VALUES
				${cycleProductIdValues}
				) d (subscription_cycle_id, product_id)
				WHERE scp.subscription_cycle_id = d.subscription_cycle_id AND scp.product_id = d.product_id`,
				_.flatten(cycleProductIds));

		});

	}

	@LogMethod()
	async delete(id: string): Promise<void> {

		const result = await this._connection.query(`SELECT account_id FROM product_setup.subscription WHERE id = $1`, [id]);
		if (!this._validateAccount(result.rows[0].account_id)) {
			throw new NotAuthorizedError();
		}

		return this._connection.withTransaction(async () => {

			await this._connection.query(`
				DELETE FROM product_setup.subscription_cycle_product scp USING product_setup.subscription_cycle sc
				WHERE scp.subscription_cycle_id = c.id AND sc.subscription_id = $1`,
				[id]);

			await this._connection.query(`DELETE FROM product_setup.subscription_cycle WHERE subscription_id = $1`, [id]);

			await this._connection.query(`DELETE FROM subscription WHERE id = $1`, [id]);

		});

	}

	@LogMethod('debug')
	private _validateAccount(subscriptionAccountId: string): boolean {
		return this._accountId === MASTER_ACCOUNT_ID || subscriptionAccountId === this._accountId;
	}

}
