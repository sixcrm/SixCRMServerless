import * as pg from 'pg';

export default class PostgresConnection {

	private _client: pg.Client | pg.Pool;

	constructor(client: pg.Client | pg.Pool) {

		this._client = client;

	}

	query(queryText: string, parameters?: any[]): Promise<pg.QueryResult> {

		return this._client.query(queryText, parameters);

	}

	async withTransaction<T>(action: () => Promise<T>): Promise<T> {

		let result: T;
		try {

			await this._client.query('BEGIN');
			result = await action();
			await this._client.query('COMMIT');

		}
		catch (error) {

			await this._client.query('ROLLBACK');
			throw error;

		}

		return result;

	}

}
