import { Connection, Repository } from 'typeorm';
import { connect, IDatabaseConfig } from './connect';
import Product from './entities/Product';

const MASTER_ACCOUNT_ID = '*';

interface IConfig extends IDatabaseConfig {
	accountId: string
}

const createProductSetupService = async ({ accountId, ...databaseConfig }: IConfig) => {
	if (!accountId) {
		throw new TypeError('Missing required accountId parameter');
	}

	try {
		const connection = await connect(databaseConfig);
		return new ProductSetupService({ accountId, connection });
	} catch(err) {
		console.error('Error connecting to Aurora', err);
		throw err;
	}
};

export default createProductSetupService;

class ProductSetupService {
	private readonly productRepository: Repository<Product>;
	private readonly accountId: string;
	private readonly baseFindOptions: { account_id?: string }

	constructor({ accountId, connection }: { accountId: string, connection: Connection }) {
		this.productRepository = connection.getRepository(Product);
		this.accountId = accountId;
		this.baseFindOptions = accountId === MASTER_ACCOUNT_ID ? {} : { account_id: accountId };
	}

	getProduct(id): Promise<Product> {
		return this.productRepository.findOneOrFail({ ...this.baseFindOptions, id });
	}

}
