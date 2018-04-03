const _ = require('underscore');
const path = require('path');
const BBPromise = require('bluebird');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

module.exports = class AuroraSchemaDeployment {

	deploy() {

		du.debug('AuroraSchemaDeployment.deploy()');

		return Promise.resolve()
			.then(this._getVersionDirectories.bind(this))
			.then((migrations) => BBPromise.each(migrations, this._deployMigration.bind(this)));

	}

	destroy() {

		du.debug('AuroraSchemaDeployment.destroy()');

		return Promise.resolve()
			.then(this._getDestroyQuery.bind(this))
			.then(this._executeQuery.bind(this));

	}

	_getVersionDirectories() {

		du.debug('AuroraSchemaDeployment._getVersionDirectories()');

		const release = Number(global.SixCRM.configuration.site_config.aurora.release);

		return Promise.resolve()
			.then(() => fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'aurora/migrations')))
			.then((results) => results.map((r) => {
				return {
					version: Number(r),
					path: path.join(global.SixCRM.routes.path('deployment', 'aurora/migrations'), r)
				};
			}))
			.then((results) => _.sortBy(_.filter(results, (f) => f.version <= release), 'version'))

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