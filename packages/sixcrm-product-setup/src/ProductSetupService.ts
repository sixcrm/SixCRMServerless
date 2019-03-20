import { Connection, Repository, FindConditions } from 'typeorm';
import Product from './models/Product';
import { validate, ValidationError } from "class-validator";
import {LogMethod} from "./log";
import ProductDbo from "./models/dbo/ProductDbo";

const MASTER_ACCOUNT_ID = '*';


interface IProductEntityId {
	id: string;
}

export default class ProductSetupService {
	private readonly productRepository: Repository<ProductDbo>;
	private readonly accountId: string;
	private readonly baseFindConditions: { account_id?: string };

	constructor({
		accountId,
		connection
	}: {
		accountId: string;
		connection: Connection;
	}) {
		this.productRepository = connection.getRepository(ProductDbo);
		this.accountId = accountId;
		this.baseFindConditions =
			accountId === MASTER_ACCOUNT_ID ? {} : { account_id: accountId };
	}

	@LogMethod()
	getProduct(id: string): Promise<Product> {
		return this.productRepository.findOneOrFail({
			...this.baseFindConditions,
			id
		}).then(dbo => dbo.toEntity());
	}

	@LogMethod()
	getAllProducts(limit?: number): Promise<Product[]> {
		return this.productRepository.find({...this.baseFindConditions, take: limit})
			.then((dbos) => dbos.map(dbo => dbo.toEntity()));
	}

	@LogMethod()
	findProducts(conditions: FindConditions<Product>): Promise<Product[]> {
		return this.productRepository.find({ ...conditions, ...this.baseFindConditions })
			.then((dbos) => dbos.map(dbo => dbo.toEntity()));
	}

	@LogMethod()
	getProductsByIds(ids: string[]): Promise<Product[]> {
		return this.productRepository.findByIds(ids, this.baseFindConditions)
			.then((dbos) => dbos.map(dbo => dbo.toEntity()));
	}

	@LogMethod()
	async createProduct(product: Product): Promise<IProductEntityId> {
		if (product.account_id === undefined) {
			product.account_id = this.accountId;
		}

		await this.validateCreateProduct(product);

		const insertResult = await this.productRepository.insert(ProductDbo.fromEntity(product));
		return insertResult.identifiers[0] as IProductEntityId;
	}

	@LogMethod()
	async updateProduct(product: Product): Promise<void> {
		if (product.account_id === undefined) {
			product.account_id = this.accountId;
		}

		if (this.isMasterAccount()) {
			delete product.account_id;
		}
		await this.validateProduct(product);

		const { account_id, id } = product;
		const updateCriteria = this.isMasterAccount ? { id } : { account_id, id };
		await this.productRepository.update(updateCriteria, ProductDbo.fromEntity(product));
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
		const errors: ValidationError[] = await validate(ProductDbo.fromEntity(product));
		const valid: boolean = !errors.length;
		if (!valid) {
			throw new Error(errors[0].toString());
		}
	}

}
