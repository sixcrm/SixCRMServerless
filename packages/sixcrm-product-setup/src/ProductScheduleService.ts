import { Connection, Repository } from 'typeorm';
import { validate, ValidationError } from "class-validator";
import { merge } from 'lodash';
import { LogMethod, logger } from "./log";
import ProductSchedule from "./models/ProductSchedule";

const MASTER_ACCOUNT_ID = '*';

const log = logger('ProductScheduleService');


interface IProductScheduleEntityId {
	id: string;
}

export default class ProductScheduleService {
	private readonly productScheduleRepository: Repository<ProductSchedule>;
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
		this.productScheduleRepository = connection.getRepository(ProductSchedule);
		this.accountId = accountId;

		const whereCondition = accountId === MASTER_ACCOUNT_ID ? {} : { where: { account_id: accountId } };
		this.baseFindConditions = {
			...whereCondition,
			relations: ['cycles', 'cycles.cycle_products', 'cycles.cycle_products.product']
		};
	}

	@LogMethod()
	get(id: string): Promise<ProductSchedule> {
		return this.productScheduleRepository.findOneOrFail(
			merge({}, this.baseFindConditions, { where: { id } })
		);
	}

	@LogMethod()
	getAll(limit?: number): Promise<ProductSchedule[]> {
		return this.productScheduleRepository.find({
			...this.baseFindConditions,
			take: limit
		});
	}

	@LogMethod()
	async create(partialProductSchedule: Partial<ProductSchedule>): Promise<IProductScheduleEntityId> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const productSchedule: ProductSchedule = this.productScheduleRepository.create({
			account_id: this.accountId,
			...partialProductSchedule
		}).validated();

		await this.validateCreateProductSchedule(productSchedule);

		let saved;
		await this.connection.transaction(async manager => {
			saved = await this.productScheduleRepository.save(productSchedule);
			for (const cycle of productSchedule.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager.save(cycle_product);
				}
			}
		});

		return saved;
	}

	@LogMethod()
	async update(partialProductSchedule: Partial<ProductSchedule>): Promise<void> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const productSchedule = this.productScheduleRepository.create({
			account_id: this.accountId,
			...partialProductSchedule
		}).validated();
		if (this.isMasterAccount()) {
			delete productSchedule.account_id;
		}
		// remove updated_at to workaround https://github.com/typeorm/typeorm/issues/2651
		delete productSchedule.updated_at;

		const { id } = productSchedule;
		let previous: ProductSchedule;
		try {
			previous = await this.get(id);
		} catch (e) {
			log.error('No product schedule found in account', e);
			throw new Error('No product schedule found in account');
		}
		await this.validateProductSchedule(productSchedule, previous);

		let saved;
		await this.connection.transaction(async manager => {
			saved = await this.productScheduleRepository.save(productSchedule);
			for (const cycle of productSchedule.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager.save(cycle_product);
				}
			}
		});

		return saved;
	}

	@LogMethod()
	async delete(id: string): Promise<IProductScheduleEntityId> {
		const deleteResult = await this.productScheduleRepository.delete({ id, ...this.baseFindConditions });
		const [, rowsAffected] = deleteResult.raw;
		if (rowsAffected === 0) {
			throw new Error('No product schedule found in account');
		}

		return { id };
	}

	@LogMethod('debug')
	private canUpdate(productAccountId: string, previousAccountId: string | null): boolean {
		return (
			this.isMasterAccount() ||
			(!!productAccountId &&
				productAccountId === this.accountId &&
				(!previousAccountId || previousAccountId === this.accountId))
		);
	}

	@LogMethod('debug')
	private isMasterAccount(): boolean {
		return this.accountId === MASTER_ACCOUNT_ID;
	}

	private async validateCreateProductSchedule(productSchedule: ProductSchedule): Promise<void> {
		const { account_id } = productSchedule;
		if (account_id === MASTER_ACCOUNT_ID) {
			throw new Error('Product schedules cannot be created on the Master account');
		}
		return this.validateProductSchedule(productSchedule);
	}

	@LogMethod('debug')
	private async validateProductSchedule(productSchedule: ProductSchedule, previous?: ProductSchedule): Promise<void> {
		const { account_id } = productSchedule;
		const previousAccountId = previous ? previous.account_id : null;
		if (!this.canUpdate(account_id, previousAccountId)) {
			throw new Error('Not authorized to save product schedule');
		}
		const errors: ValidationError[] = await validate(productSchedule);
		const valid: boolean = !errors.length;
		if (!valid) {
			throw new Error(errors[0].toString());
		}
	}

}
