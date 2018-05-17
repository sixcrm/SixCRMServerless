const _ = require('lodash');
const path = require('path');
const BBPromise = require('bluebird');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

module.exports = class AuroraSchemaDeployment {

	async deploy(options = {}) {

		du.debug('AuroraSchemaDeployment.deploy()');

		return auroraContext.withConnection(async (connection) => {

			const migrations = await this._getVersionDirectories(connection, options);
			du.debug('AuroraSchemaDeployment.deploy(): migrations', migrations);
			await BBPromise.each(migrations, m => this._deployMigration(m, connection));
			return 'Aurora deploy complete';

		});

	}

	async destroy() {

		du.debug('AuroraSchemaDeployment.destroy()');

		return auroraContext.withConnection(async (connection) => {

			return this._executeQuery(connection, 'DROP SCHEMA IF EXISTS analytics CASCADE');

		});

	}

	/*
		We want all revisions from the current version from the database up until the configured version
		in the configuration, and then run them sequentially
	*/
	async _getVersionDirectories(connection, options) {

		du.debug('AuroraSchemaDeployment._getVersionDirectories()');

		const release = global.SixCRM.configuration.site_config.aurora.release;

		const results = await fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'aurora/migrations'));

		du.debug('AuroraSchemaDeployment._getVersionDirectories(): getDirectoryFiles', results);

		const migrations = results.map((r) => {
			return {
				version: Number(r),
				path: path.join(global.SixCRM.routes.path('deployment', 'aurora/migrations'), r)
			};
		});

		let currentRevision = null;

		try {

			const currentRevisionRaw = await this._executeQuery(connection, 'SELECT id FROM analytics.m_release ORDER BY id DESC LIMIT 1');
			currentRevision = Number(currentRevisionRaw.rows.length ? currentRevisionRaw.rows[0].id : 0);

		} catch (ex) {

			du.warning('Could not resolve the current aurora schema version', ex);

			currentRevision = 0;

		}

		du.debug('AuroraSchemaDeployment._getVersionDirectories(): current revision', currentRevision);

		return _.sortBy(_.filter(migrations, (f) => {

			const revision = (options.fromRevision ? options.fromRevision : currentRevision) || 0;

			return f.version <= Number(release) && f.version > revision;

		}), 'version');

	}

	async _deployMigration(migration, connection) {

		du.debug('AuroraSchemaDeployment._deployMigration()', migration);

		const body = await fileutilities.getFileContents(path.join(migration.path, 'manifest.json'));
		const manifests = JSON.parse(body);

		await BBPromise.each(manifests, async (m) => {

			const query = await fileutilities.getFileContents(path.join(migration.path, m.script));
			await this._executeQuery(connection, query);

		});

		await this._executeQuery(connection, 'INSERT INTO analytics.m_release (id) VALUES($1) ON CONFLICT (id) DO UPDATE SET id = $2', [migration.version, migration.version]);

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
