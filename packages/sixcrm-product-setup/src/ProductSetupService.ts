import { Connection, Repository } from 'typeorm';
import Product from './entities/Product';

const MASTER_ACCOUNT_ID = '*';

export default class ProductSetupService {
	private readonly productRepository: Repository<Product>;
	private readonly accountId: string;
	private readonly baseFindOptions: { account_id?: string };

	constructor({
		accountId,
		connection
	}: {
		accountId: string;
		connection: Connection;
	}) {
		this.productRepository = connection.getRepository(Product);
		this.accountId = accountId;
		this.baseFindOptions =
			accountId === MASTER_ACCOUNT_ID ? {} : { account_id: accountId };
	}

	getProduct(id): Promise<Product> {
		return this.productRepository.findOneOrFail({
			...this.baseFindOptions,
			id
		});
	}

	getAllProducts(): Promise<Product[]> {
		return this.productRepository.find({ ...this.baseFindOptions });
	}

	save(product: Product): Promise<Product> {
		return this.productRepository.save(product);
	}
}
