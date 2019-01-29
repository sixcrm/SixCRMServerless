import ProductSetupService from './ProductSetupService';
import { connect, IDatabaseConfig } from './connect';
import * as Logger from 'js-logger';

Logger.useDefaults({
	defaultLevel: {value: Number(process.env.VERBOSE), name: 'SIX_VERBOSE'},
	formatter: (messages, context) => {
		messages.unshift(`[${context.name}]`);
		messages.unshift(']');
		messages.unshift(new Date());
		messages.unshift('[');
	}
});

let productSetupService;

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
		// tslint:disable-next-line no-console
		console.error('Error connecting to Aurora', err);
		throw err;
	}
};

export const getProductSetupService = () => productSetupService;
