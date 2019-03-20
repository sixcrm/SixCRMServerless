import { randomBytes } from 'crypto';
import 'reflect-metadata';
import { createConnection, getConnection, ConnectionOptions } from 'typeorm';
import { logger } from './log';
import ProductDbo from "./models/dbo/ProductDbo";
import ProductScheduleDbo from "./models/dbo/ProductScheduleDbo";
import CycleDbo from "./models/dbo/CycleDbo";
import CycleProductDbo from "./models/dbo/CycleProductDbo";

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
		entities: [ ProductDbo, ProductScheduleDbo, CycleDbo, CycleProductDbo ],
		synchronize: true,
		logging: true,
		...config
	} as ConnectionOptions;
};

export const connect = async (config: IDatabaseConfig) => {
	if (connection) {
		try {
			await connection;
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
		const closePromise = (await connection).close();
		connection = null;
		return closePromise;
	}
};
