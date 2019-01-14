import { randomBytes } from 'crypto';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import Product from './entities/Product';

const connectionName = randomBytes(5).toString('hex');
let connection;

// TODO replace hardcoded config with package config
const connect  = () => {
	if (connection) {
		try {
			return getConnection(connectionName);
		} catch (e) {
			console.error('Error with connection', e);
			connection = null;
		}
	}

	console.error('Create and return connection');
	connection = createConnection({
		name: connectionName,
		type: 'postgres',
		host: '127.0.0.1',
		port: 5440,
		username: 'root',
		password: 'Jagodica9',
		database: 'postgres',
		schema: 'evan_product_setup',
		entities: [
			Product
		],
		synchronize: true,
		logging: true
	});
	return connection;
}

export default connect;
