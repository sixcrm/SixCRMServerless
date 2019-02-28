import { Connection, Repository, FindConditions } from 'typeorm';
import { validate, ValidationError } from "class-validator";
import {LogMethod} from "./log";
import ProductSchedule from "./models/ProductSchedule";

const MASTER_ACCOUNT_ID = '*';


interface IProductScheduleEntityId {
	id: string;
}

export default class ProductScheduleService {
	private readonly productScheduleRepository: Repository<ProductSchedule>;
	private readonly accountId: string;
	private readonly baseFindConditions: { account_id?: string };

	constructor({
		accountId,
		connection
	}: {
		accountId: string;
		connection: Connection;
	}) {
		this.productScheduleRepository = connection.getRepository(ProductSchedule);
		this.accountId = accountId;
		this.baseFindConditions =
			accountId === MASTER_ACCOUNT_ID ? {} : { account_id: accountId };
	}

	@LogMethod()
	get(id: string): Promise<ProductSchedule> {
		return this.productScheduleRepository.findOneOrFail({
			...this.baseFindConditions,
			id
		});
	}

	@LogMethod()
	async create(partialProductSchedule: Partial<ProductSchedule>): Promise<IProductScheduleEntityId> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const ProductSchedule = this.productScheduleRepository.create({
			account_id: this.accountId,
			...partialProductSchedule
		});
		await this.validateCreateProductSchedule(ProductSchedule);

		const insertResult = await this.productScheduleRepository.insert(ProductSchedule);
		return insertResult.identifiers[0] as IProductScheduleEntityId;
	}

	@LogMethod()
	async update(partialProductSchedule: Partial<ProductSchedule>): Promise<void> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const productSchedule = this.productScheduleRepository.create({
			account_id: this.accountId,
			...partialProductSchedule
		});
		if (this.isMasterAccount()) {
			delete productSchedule.account_id;
		}
		// remove updated_at to workaround https://github.com/typeorm/typeorm/issues/2651
		delete productSchedule.updated_at;
		await this.validateProductSchedule(productSchedule);

		const { account_id, id } = productSchedule;
		const updateCriteria = this.isMasterAccount ? { id } : { account_id, id };
		await this.productScheduleRepository.update(updateCriteria, productSchedule);
	}

	@LogMethod()
	async delete(id: string): Promise<IProductScheduleEntityId> {
		const deleteResult = await this.productScheduleRepository.delete({ id, ...this.baseFindConditions });
		const [, rowsAffected] = deleteResult.raw;
		if (rowsAffected === 0) {
			throw new Error('No product found in account');
		}

		return { id };
	}

	@LogMethod('debug')
	private canUpdate(productAccountId: string): boolean {
		return this.isMasterAccount() || !!productAccountId && productAccountId === this.accountId;
	}

	@LogMethod('debug')
	private isMasterAccount(): boolean {
		return this.accountId === MASTER_ACCOUNT_ID;
	}

	private async validateCreateProductSchedule(product: ProductSchedule): Promise<void> {
		const { account_id } = product;
		if (account_id === MASTER_ACCOUNT_ID) {
			throw new Error('ProductSchedules cannot be created on the Master account');
		}
		return this.validateProductSchedule(product);
	}

	@LogMethod('debug')
	private async validateProductSchedule(product: ProductSchedule): Promise<void> {
		const { account_id } = product;
		if (!this.canUpdate(account_id)) {
			throw new Error('Not authorized to save product');
		}
		const errors: ValidationError[] = await validate(product);
		const valid: boolean = !errors.length;
		if (!valid) {
			throw new Error(errors[0].toString());
		}
	}

}
