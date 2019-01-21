import { Connection, Repository } from 'typeorm';
import Product from './models/Product';
import { validate } from "class-validator";


const MASTER_ACCOUNT_ID = '*';

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
		return this.productRepository.findOneOrFail({
			...this.baseFindConditions,
			id
		});
	}

	getAllProducts(): Promise<Product[]> {
		return this.productRepository.find(this.baseFindConditions);
	}

	getProductsByIds(ids: string[]): Promise<Product[]> {
		return this.productRepository.findByIds(ids, this.baseFindConditions);
	}

	async createProduct(product: Product): Promise<Product> {
		await this.validateProduct(product);
		const { account_id: productAccountId } = product;
		if (!this.canCreateProduct(productAccountId)) {
			throw new Error('Products cannot be created on the Master account');
		}

		const insertResult = await this.productRepository.insert({ account_id: this.accountId, ...product });
		const [{ id }] = insertResult.identifiers;
		return this.getProduct(id);
	}

	async updateProduct(product: Product): Promise<Product> {
		const { account_id: productAccountId = this.accountId, id } = product;
		if (!this.canUpdateProduct(productAccountId)) {
			throw new Error('Not authorized to update product');
		}
		const updateCriteria = this.isMasterAccount ? { id } : { account_id: productAccountId, id };
		await this.productRepository.update(updateCriteria, { ...product });
		return this.getProduct(id);
	}

	async deleteProduct(id: string): Promise<{ id: string}> {
		const deleteResult = await this.productRepository.delete({ id, ...this.baseFindConditions });
		const [, rowsAffected] = deleteResult.raw;
		if (rowsAffected === 0) {
			throw new Error('No product found in account');
		}

		return { id };
	}

	private canCreateProduct(productAccountId: string): boolean {
		return !!productAccountId || !this.isMasterAccount();
	}

	private canUpdateProduct(productAccountId: string): boolean {
		return productAccountId && this.isMasterAccount() || productAccountId === this.accountId;
	}

	private isMasterAccount(): boolean {
		return this.accountId === MASTER_ACCOUNT_ID;
	}

	private async isValidProduct(product: Product): Promise<boolean> {
		const errors = await validate(product);
		return !errors.length;
	}

	private async validateProduct(product: Product): Promise<void> {
		const valid = await this.isValidProduct(product);
		if (!valid) {
			throw new Error('Product is not valid');
		}
	}
}
