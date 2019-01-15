import { randomBytes } from 'crypto';
import 'reflect-metadata';
import { createConnection, getConnection, getConnectionOptions, ConnectionOptions } from 'typeorm';
import Product from './entities/Product';

const connectionName = randomBytes(5).toString('hex');
let connection;

export interface IDatabaseConfig {
	host: string;
	port?: number;
	username: string;
	password: string;
	database?: string;
	schema?: string;
}

const toConnectionOptions = (config: IDatabaseConfig) => {
	return {
		name: connectionName,
		type: 'postgres',
		port: 5440,
		database: 'postgres',
		schema: 'product_setup',
		entities: [ Product ],
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
			console.error('Error with connection', e);
			connection = null;
		}
	}

	connection = createConnection(toConnectionOptions(config));
	return connection;
}
