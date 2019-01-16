import { Connection, Repository } from 'typeorm';
import Product from './entities/Product';

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

	save(product: Product): Promise<Product> {
		return this.productRepository.save(product);
	}
}
