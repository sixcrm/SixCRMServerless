import { Connection, Repository, FindConditions } from 'typeorm';
import Product from './models/Product';
import { validate, ValidationError } from "class-validator";
import * as Logger from 'js-logger';

const MASTER_ACCOUNT_ID = '*';
const log = Logger.get('ProductSetupService');

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

	getProduct(id: string): Promise<Product> {
		log.debug('getProduct', id);
		return this.productRepository.findOneOrFail({
			...this.baseFindConditions,
			id
		});
	}

	getAllProducts(): Promise<Product[]> {
		return this.productRepository.find(this.baseFindConditions);
	}

	findProducts(conditions: FindConditions<Product>): Promise<Product[]> {
		return this.productRepository.find({ ...conditions, ...this.baseFindConditions });
	}

	getProductsByIds(ids: string[]): Promise<Product[]> {
		return this.productRepository.findByIds(ids, this.baseFindConditions);
	}

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

	async updateProduct({ updated_at, ...partialProduct }: Partial<Product>): Promise<void> {
		// shallow copy to avoid typeorm issues with objects without prototypes
		// https://github.com/typeorm/typeorm/issues/2065
		const product = this.productRepository.create(partialProduct);
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

	async deleteProduct(id: string): Promise<IProductEntityId> {
		const deleteResult = await this.productRepository.delete({ id, ...this.baseFindConditions });
		const [, rowsAffected] = deleteResult.raw;
		if (rowsAffected === 0) {
			throw new Error('No product found in account');
		}

		return { id };
	}

	private canUpdateProduct(productAccountId: string): boolean {
		return this.isMasterAccount() || productAccountId === this.accountId;
	}

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
