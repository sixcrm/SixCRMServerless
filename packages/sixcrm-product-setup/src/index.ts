import ProductSetupService from './ProductSetupService';
import { connect, IDatabaseConfig } from './connect';
import { logger } from '@6crm/sixcrm-platform/lib/log';
import ProductSetupServiceNotFoundError from './errors/ProductSetupServiceNotFoundError';
import ProductScheduleService from "./ProductScheduleService";
import ProductScheduleServiceNotFoundError from "./errors/ProductScheduleServiceNotFoundError";

let productSetupService;
let productScheduleService;

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

	if (process.env.AURORA_PROXY === 'true') {
		databaseConfig.host = '127.0.0.1';
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

export const createProductScheduleService = async ({
	accountId,
	...databaseConfig
}: IConfig) => {
	if (!accountId) {
		throw new TypeError('Missing required accountId parameter');
	}

	try {
		const connection = await connect(databaseConfig);
		productScheduleService = new ProductScheduleService({ accountId, connection });
		return productScheduleService;
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

export const getProductScheduleService = () => {
	if (!productScheduleService) {
		throw new ProductScheduleServiceNotFoundError();
	}

	return productScheduleService;
};


export { default as Product } from './models/Product';
export { default as LegacyProduct } from './models/legacy/LegacyProduct';
export { default as LegacyProductSchedule } from './models/legacy/LegacyProductSchedule';
