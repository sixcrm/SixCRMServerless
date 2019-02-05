import { Connection, Repository, FindConditions } from 'typeorm';
import Product from './models/Product';
import { validate, ValidationError } from "class-validator";
import {LogMethod} from "./log";

const MASTER_ACCOUNT_ID = '*';


interface IProductEntityId {
	id: string;
}

export default class ProductSetupService {
	private readonly productRepository: Repository<Product>;
	private readonly accountId: string;
	private readonly baseFindConditions: { account_id?: string };

	constructor({
		accountId,
		connection
	}: {
		accountId: string;
		connection: Connection;
	}) {
		this.productRepository = connection.getRepository(Product);
		this.accountId = accountId;
		this.baseFindConditions =
			accountId === MASTER_ACCOUNT_ID ? {} : { account_id: accountId };
	}

	@LogMethod()
	getProduct(id: string): Promise<Product> {
		return this.productRepository.findOneOrFail({
			...this.baseFindConditions,
			id
		});
	}

	@LogMethod()
	getAllProducts(): Promise<Product[]> {
		return this.productRepository.find(this.baseFindConditions);
	}

	@LogMethod()
	findProducts(conditions: FindConditions<Product>): Promise<Product[]> {
		return this.productRepository.find({ ...conditions, ...this.baseFindConditions });
	}

	@LogMethod()
	getProductsByIds(ids: string[]): Promise<Product[]> {
		return this.productRepository.findByIds(ids, this.baseFindConditions);
	}

	@LogMethod()
	async createProduct(partialProduct: Partial<Product>): Promise<IProductEntityId> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const product = this.productRepository.create({
			account_id: this.accountId,
			...partialProduct
		});
		await this.validateCreateProduct(product);

		const insertResult = await this.productRepository.insert(product);
		return insertResult.identifiers[0] as IProductEntityId;
	}

	@LogMethod()
	async updateProduct(partialProduct: Partial<Product>): Promise<void> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const product = this.productRepository.create({
			account_id: this.accountId,
			...partialProduct
		});
		if (this.isMasterAccount()) {
			delete product.account_id;
		}
		// remove updated_at to workaround https://github.com/typeorm/typeorm/issues/2651
		delete product.updated_at;
		await this.validateProduct(product);

		const { account_id, id } = product;
		const updateCriteria = this.isMasterAccount ? { id } : { account_id, id };
		await this.productRepository.update(updateCriteria, product);
	}

	@LogMethod()
	async deleteProduct(id: string): Promise<IProductEntityId> {
		const deleteResult = await this.productRepository.delete({ id, ...this.baseFindConditions });
		const [, rowsAffected] = deleteResult.raw;
		if (rowsAffected === 0) {
			throw new Error('No product found in account');
		}

		return { id };
	}

	@LogMethod('debug')
	private canUpdateProduct(productAccountId: string): boolean {
		return this.isMasterAccount() || !!productAccountId && productAccountId === this.accountId;
	}

	@LogMethod('debug')
	private isMasterAccount(): boolean {
		return this.accountId === MASTER_ACCOUNT_ID;
	}

	private async validateCreateProduct(product: Product): Promise<void> {
		const { account_id } = product;
		if (account_id === MASTER_ACCOUNT_ID) {
			throw new Error('Products cannot be created on the Master account');
		}
		return this.validateProduct(product);
	}

	@LogMethod('debug')
	private async validateProduct(product: Product): Promise<void> {
		const { account_id } = product;
		if (!this.canUpdateProduct(account_id)) {
			throw new Error('Not authorized to save product');
		}
		const errors: ValidationError[] = await validate(product);
		const valid: boolean = !errors.length;
		if (!valid) {
			throw new Error(errors[0].toString());
		}
	}

}
