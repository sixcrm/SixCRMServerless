import { Connection, Repository } from 'typeorm';
import { validate, ValidationError } from "class-validator";
import { merge } from 'lodash';
import { LogMethod, logger } from "./log";
import ProductSchedule from "./models/ProductSchedule";
import ProductScheduleDbo from "./models/dbo/ProductScheduleDbo";
import CycleProductDbo from "./models/dbo/CycleProductDbo";
import CycleDbo from "./models/dbo/CycleDbo";

const MASTER_ACCOUNT_ID = '*';

const log = logger('ProductScheduleService');


interface IProductScheduleEntityId {
	id: string;
}

export default class ProductScheduleService {
	private readonly productScheduleRepository: Repository<ProductScheduleDbo>;
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
		this.productScheduleRepository = connection.getRepository(ProductScheduleDbo);
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
		).then(dbo => dbo.toEntity())
	}

	@LogMethod()
	getAll(limit?: number): Promise<ProductSchedule[]> {
		return this.productScheduleRepository.find({
			...this.baseFindConditions,
			take: limit
		}).then((dbos) => dbos.map(dbo => dbo.toEntity()));
	}

	@LogMethod()
	async create(productSchedule: ProductSchedule): Promise<ProductSchedule> {
		if (productSchedule.account_id === undefined) {
			productSchedule.account_id = this.accountId;
		}

		await this.validateCreateProductSchedule(productSchedule);
		const productScheduleDbo = ProductScheduleDbo.fromEntity(productSchedule);

		let saved;
		await this.connection.transaction(async manager => {
			saved = await manager.save(productScheduleDbo);
			for (const cycle of productScheduleDbo.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager
						.createQueryBuilder()
						.relation(CycleDbo, 'cycle_products')
						.of(cycle)
						.add({ cycle, product: cycle_product });
				}
			}
		});

		return saved;
	}

	@LogMethod()
	async update(productSchedule: ProductSchedule): Promise<void> {
		if (productSchedule.account_id === undefined) {
			productSchedule.account_id = this.accountId;
		}
		if (this.isMasterAccount()) {
			delete productSchedule.account_id;
		}

		const { id } = productSchedule;
		let previous: ProductSchedule;
		try {
			previous = await this.get(id);
		} catch (e) {
			log.error('No product schedule found in account', e);
			throw new Error('No product schedule found in account');
		}
		await this.validateProductSchedule(productSchedule, previous);

		const productScheduleDbo = ProductScheduleDbo.fromEntity(productSchedule);

		await this.connection.transaction(async manager => {
			await manager.save(productScheduleDbo);
			for (const cycle of productScheduleDbo.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager
						.createQueryBuilder()
						.relation(CycleDbo, 'cycle_products')
						.of(cycle)
						.add({ cycle, product: cycle_product });
				}
			}
		});
	}

	@LogMethod()
	async delete(id: string): Promise<IProductScheduleEntityId> {
		const productSchedule = await this.get(id);
		const productScheduleDbo = ProductScheduleDbo.fromEntity(productSchedule);

		await this.connection.transaction(async manager => {
			for (const cycle of productScheduleDbo.cycles) {
				for (const cycle_product of cycle.cycle_products) {
					await manager.delete(CycleProductDbo, {cycle: cycle_product.cycle, product: cycle_product.product});
				}
				await manager.delete(CycleDbo, cycle.id);
			}
			await manager.delete(ProductScheduleDbo, id);
		});

		return  { id };
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
