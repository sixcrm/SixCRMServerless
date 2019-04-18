import SubscriptionService from './SubscriptionService';
import IPostgresConfig from '@6crm/sixcrm-data/lib/config/Postgres';
import PostgresConnection from '@6crm/sixcrm-data/lib/PostgresConnection';
import * as pg from 'pg';
import { logger } from '@6crm/sixcrm-platform/lib/log';

const log = logger('SubscriptionService');

export const createSubscriptionService = async (accountId: string, databaseConfig: IPostgresConfig)
	: Promise<SubscriptionService> => {

	if (!accountId) {
		throw new TypeError('Missing required accountId parameter');
	}

	if (process.env.AURORA_PROXY === 'true') {
		databaseConfig.host = '127.0.0.1';
	}

	try {
		const client = new pg.Client(databaseConfig);
		await client.connect();
		const connection = new PostgresConnection(client);
		return new SubscriptionService(accountId, connection);
	} catch (err) {
		log.error('Error connecting to Aurora', err);
		throw err;
	}

};
