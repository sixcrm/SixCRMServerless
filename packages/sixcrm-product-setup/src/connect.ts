import { randomBytes } from 'crypto';
import 'reflect-metadata';
import { createConnection, getConnection, getConnectionOptions, ConnectionOptions } from 'typeorm';
import Product from './models/Product';
import { logger } from './log';
import ProductSchedule from "./models/ProductSchedule";
import CycleProduct from "./models/CycleProduct";
import Cycle from "./models/Cycle";

const connectionName = randomBytes(5).toString('hex');
let connection;

const log = logger('ProductSetupConnect');

export interface IDatabaseConfig {
	host: string;
	port?: number;
	username: string;
	password: string;
	database?: string;
	schema?: string;
	logging?: string[];
}

const toConnectionOptions = (config: IDatabaseConfig) => {
	return {
		name: connectionName,
		type: 'postgres',
		port: 5440,
		database: 'postgres',
		schema: 'product_setup',
		entities: [ Product, ProductSchedule, Cycle, CycleProduct ],
		synchronize: true,
		logging: true,
		...config
	} as ConnectionOptions;
};

export const connect = async (config: IDatabaseConfig) => {
	if (connection) {
		try {
			return getConnection(connectionName);
		} catch (e) {
			log.warn('Replacing connection due to error', e);
			connection = null;
		}
	}
	connection = createConnection(toConnectionOptions(config));
	return connection;
};

export const disconnect = async () => {
	if (connection) {
		return (await connection).close();
	}
};
