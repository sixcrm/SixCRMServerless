const _ = require('lodash');
const path = require('path');
const BBPromise = require('bluebird');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/lib/util/file-utilities').default;
const auroraContext = require('@6crm/sixcrmcore/lib/util/analytics/aurora-context').default;

module.exports = class AuroraSchemaDeployment {

	async deploy(options = {}) {

		const schemas = this._getSchemas();

		return auroraContext.withConnection(async connection =>
			BBPromise.each(schemas, schema => this._deploySchema(schema, connection, options)));

	}

	async _getSchemas() {

		return fileutilities.getDirectories(global.SixCRM.routes.path('deployment', 'aurora/migrations'));

	}

	async _deploySchema(schema, connection, options) {

		du.info('Deploying schema ' + schema);

		this._executeQuery(connection, `CREATE SCHEMA IF NOT EXISTS ${schema}`);
		this._executeQuery(connection, `CREATE TABLE IF NOT EXISTS ${schema}.m_release (
			id INT NOT NULL PRIMARY KEY,
			created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`);

		let currentRevision;

		try {

			const currentRevisionRaw = await this._executeQuery(connection, `SELECT id FROM ${schema}.m_release ORDER BY id DESC LIMIT 1`);
			currentRevision = Number(currentRevisionRaw.rows.length ? currentRevisionRaw.rows[0].id : 0);
			du.debug('AuroraSchemaDeployment._deploySchema(): current revision', currentRevision);

		} catch (ex) {

			du.error('Could not resolve the current aurora schema version', ex);
			throw ex;

		}

		const fromRevision = options.fromRevision || currentRevision || 0;

		const migrations = await this._getNewMigrations(schema, fromRevision);

		return BBPromise.each(migrations, migration => this._deployMigration(migration, schema, connection));

	}

	/*
		We want all revisions from the current version from the database up until the configured version
		in the configuration, and then run them sequentially
	*/
	async _getNewMigrations(schema, fromRevision) {

		const results = await fileutilities.getDirectories(path.join(global.SixCRM.routes.path('deployment', 'aurora/migrations'), schema));

		const migrations = results.map((r) => {
			return {
				version: Number(r),
				path: path.join(global.SixCRM.routes.path('deployment', 'aurora/migrations'), schema, r)
			};
		});

		return _.sortBy(_.filter(migrations, (f) => f.version > fromRevision), 'version');

	}

	async _deployMigration(migration, schema, connection) {

		du.info('Deploying migration ' + migration.path);

		const body = await fileutilities.getFileContents(path.join(migration.path, 'manifest.json'));
		const manifests = JSON.parse(body);

		await BBPromise.each(manifests, async (m) => {

			const query = await fileutilities.getFileContents(path.join(migration.path, m.script));
			await this._executeQuery(connection, query);

		});

		await this._executeQuery(connection, `INSERT INTO ${schema}.m_release (id) VALUES($1) ON CONFLICT (id) DO UPDATE SET id = $2`, [migration.version, migration.version]);

	}

	async _executeQuery(connection, query, args) {

		du.debug('AuroraSchemaDeployment._executeQuery()', query);

		if (!query) {

			return;

		}

		if (args && args.length) {

			return connection.queryWithArgs(query, args);

		} else {

			return connection.query(query);

		}

	}

}
