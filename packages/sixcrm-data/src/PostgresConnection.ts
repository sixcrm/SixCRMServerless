import * as pg from 'pg';
import { logger } from '@6crm/sixcrm-platform/lib/log';

const log = logger('PostgresConnection');

export default class PostgresConnection {

	private _client: pg.Client | pg.Pool;

	constructor(client: pg.Client | pg.Pool) {

		this._client = client;

	}

	async dispose() {

		return this._client.end();

	}

	query(queryText: string, parameters?: any[]): Promise<pg.QueryResult> {

		if (parameters === undefined) {
			log.debug('query:', queryText);
		}
		else {
			log.debug('query:', queryText, parameters);
		}

		return this._client.query(queryText, parameters);

	}

	async withTransaction<T>(action: () => Promise<T>): Promise<T> {

		let result: T;
		try {

			await this.query('BEGIN');
			result = await action();
			await this.query('COMMIT');

		}
		catch (error) {

			await this.query('ROLLBACK');
			throw error;

		}

		return result;

	}

	static getValuesSubstitution(rows: any[], startIndex: number = 1) {

		return rows.map((values, i) =>
			'(' + values.map((value, j) => `$${i*values.length + j + startIndex}`).join(',') + ')')
			.join(',\n');

	}

}
