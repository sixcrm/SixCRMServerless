const _ = require('underscore');
const path = require('path');
const BBPromise = require('bluebird');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

module.exports = class AuroraSchemaDeployment {

	deploy(options = {}) {

		du.debug('AuroraSchemaDeployment.deploy()');

		return Promise.resolve()
			.then(() => this._getVersionDirectories(options))
			.then((migrations) => BBPromise.each(migrations, this._deployMigration.bind(this)))
			.then(() => 'Aurora deploy complete');

	}

	destroy() {

		du.debug('AuroraSchemaDeployment.destroy()');

		return Promise.resolve()
			.then(this._getDestroyQuery.bind(this))
			.then(this._executeQuery.bind(this));

	}

	/*
		We want all revisions from the current version from the database up until the configured version
		in the configuration, and then run them sequentially
	*/
	_getVersionDirectories(options) {

		du.debug('AuroraSchemaDeployment._getVersionDirectories()');

		const release = global.SixCRM.configuration.site_config.aurora.release;

		return Promise.resolve()
			.then(() => fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'aurora/migrations')))
			.then((results) => results.map((r) => {
				return {
					version: Number(r),
					path: path.join(global.SixCRM.routes.path('deployment', 'aurora/migrations'), r)
				};
			}))
			.then((migrations) => this._executeQuery('SELECT id FROM analytics.m_release ORDER BY id DESC LIMIT 1').then((currentRevision) => {
				return {
					currentRevision: Number(currentRevision.rows[0]),
					migrations
				}
			}).catch((ex) => {

				du.warning('Could not resolve the current aurora schema version', ex);

				return {
					currentRevision: 0,
					migrations
				}
			}))
			.then((result) => _.sortBy(_.filter(result.migrations, (f) => {

				const currentRevision = options.fromRevision ? options.fromRevision : result.currentRevision;

				return f.version <= Number(release) && f.version > currentRevision;

			}), 'version'))

	}

	_deployMigration(migration) {

		du.debug('AuroraSchemaDeployment._deployMigration()', migration);

		return Promise.resolve()
			.then(() => fileutilities.getFileContents(path.join(migration.path, 'manifest.json')))
			.then((manifests) => BBPromise.each(JSON.parse(manifests), (m) => {

				return Promise.resolve()
					.then(() => fileutilities.getFileContents(path.join(migration.path, m.script)))
					.then(this._executeQuery.bind(this));

			}));

	}

	_getDestroyQuery() {

		du.debug('AuroraSchemaDeployment._getDestroyQuery()');

		return Promise.resolve()
			.then(() => this._executeQuery('DROP SCHEMA IF EXISTS analytics CASCADE'));

	}

	_executeQuery(query) {

		du.debug('AuroraSchemaDeployment._executeQuery()');

		if (!query) {

			return Promise.resolve();

		}

		return auroraContext.withConnection((connection => {

			return connection.query(query);

		}));

	}

}