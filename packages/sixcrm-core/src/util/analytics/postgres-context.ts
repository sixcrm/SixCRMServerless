import * as pg from 'pg';
import du from '../debug-utilities';
import eu from '../error-utilities';
import { RedshiftConnection } from '@adexchange/aeg-redshift';
import * as moment from 'moment-timezone';
import { IRedshiftConnectionOptions } from '@adexchange/aeg-redshift/lib/redshift-connection';

// timestamp
pg.types.setTypeParser(1114, (stringValue) => {

	return moment.tz(stringValue, 'YYYY-MM-DD HH:mm:ss', 'UTC').toISOString();

});

// date
pg.types.setTypeParser(1082, (stringValue) => {

	return stringValue;

});

export default class PostgresContext {

	_connection: RedshiftConnection | null;
	_configRoot: string;

	constructor(configRoot: string) {

		this._connection = null;
		this._configRoot = configRoot;

	}

	init() {

		du.debug('PostgresContext.init()');

		if (this._connection) {

			return Promise.resolve();

		}

		return this._resolveConfiguration()
			.then((config) => {

				this._connection = new RedshiftConnection(config);
				return;

			});

	}

	dispose() {

		du.debug('PostgresContext.dispose()');

		return this.connection.dispose().then(() => {

			return this._connection = null;

		});

	}

	get connection() {

		if (!this._connection) {

			throw eu.getError('server', 'Postgres connection not initialized');

		}

		return this._connection;

	}

	withConnection(delegate: (connection: RedshiftConnection) => Promise<any>) {

		return this._resolveConfiguration()
			.then((config) => {

				return RedshiftConnection.withConnection(delegate, config);

			});

	}

	async testConnection() {

		try {

			await this.withConnection((connection) => {

				return connection.query('SELECT 1');

			});

			return {
				status: 'OK',
				message: 'Successfully connected to Aurora'
			};

		} catch (ex) {

			return {
				status: 'ERROR',
				message: ex.message
			};

		}

	}

	_resolveConfiguration(): Promise<IRedshiftConnectionOptions> {

		return new Promise((resolve, reject) => {

			const config = global.SixCRM.configuration.site_config[this._configRoot];

			if (!config.host) {

				du.debug('PostgresContext._createConnection(): fetching host');

				global.SixCRM.configuration.getEnvironmentConfig(`${this._configRoot}_host`)
					.then((host) => {

						du.debug('PostgresContext._createConnection(): host fetched', host);

						config.host = host;

						return resolve(config);

					})
					.catch((ex) => {

						reject(ex);

					});

			} else {

				resolve(config);

			}

		});

	}

}
