import { Connection, Repository } from 'typeorm';
import getConnection from './connect';
import Product from './entities/Product';


const createProductSetupService = async () => {

	try {
		const connection = await getConnection();
		return new ProductSetupService(connection);
	} catch(err) {
		console.error('Error connecting to Aurora', err);
		throw err;
	}
};

export default createProductSetupService;

class ProductSetupService {
	private readonly productRepository: Repository<Product>;

	constructor(connection: Connection) {
		this.productRepository = connection.getRepository(Product);
	}

	getProduct(id): Promise<Product> {
		return this.productRepository.findOneOrFail(id);
	}

}
