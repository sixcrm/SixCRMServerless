import ProductSetupService from './ProductSetupService';
import { connect, IDatabaseConfig } from './connect';
import { logger } from './log';
import ProductSetupServiceNotFoundError from './errors/ProductSetupServiceNotFoundError';

let productSetupService;

const log = logger('ProductSetupService');

interface IConfig extends IDatabaseConfig {
	accountId: string;
}

export const createProductSetupService = async ({
	accountId,
	...databaseConfig
}: IConfig) => {
	if (!accountId) {
		throw new TypeError('Missing required accountId parameter');
	}

	try {
		const connection = await connect(databaseConfig);
		productSetupService = new ProductSetupService({ accountId, connection });
		return productSetupService;
	} catch (err) {
		log.error('Error connecting to Aurora', err);
		throw err;
	}
};

export const getProductSetupService = () => {
	if (!productSetupService) {
		throw new ProductSetupServiceNotFoundError();
	}

	return productSetupService;
};

export { default as Product } from './models/Product';
export { default as LegacyProduct } from './models/legacy/LegacyProduct';
