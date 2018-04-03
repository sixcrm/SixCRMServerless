const _ = require('underscore');
const path = require('path');
const BBPromise = require('bluebird');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
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

	seed() {

		du.debug('AuroraSchemaDeployment.seed()');

		return Promise.resolve()
			.then(this._getSeedQueries.bind(this))
			.then(this._executeQueries.bind(this));

	}

	purge() {

		du.debug('AuroraSchemaDeployment.purge()');

		return this._purgeTableDirectory('tables');

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
			.then(() => this._deployDirectorySQL(path.join(migration.path, 'pre')))
			.then(() => this._deployDirectorySQL(path.join(migration.path, 'procedures')))
			.then(() => this._deployDirectorySQL(path.join(migration.path, 'scripts')))
			.then(() => this._deployDirectorySQL(path.join(migration.path, 'tables')));

	}

	_deployDirectorySQL(directory) {

		du.debug('AuroraSchemaDeployment._deployDirectorySQL()', directory);

		return this._getDirectorySQLFilepaths(directory)
			.then(this._getQueries.bind(this))
			.then(this._executeQueries.bind(this));

	}

	_getDirectorySQLFilepaths(directory) {

		du.highlight('AuroraSchemaDeployment._getDirectorySQLFilepaths()');

		return fileutilities.getDirectoryFiles(directory).then((files) => {

			const filter = arrayutilities.filter(files, (file) => {

				return file.match(/\.sql$/);

			});

			return arrayutilities.map(filter, (file) => {

				return path.join(directory, file);

			});

		});

	}

	_getQueries(queryFilepaths) {

		du.debug('AuroraSchemaDeployment._getQueries()');

		const promises = _.reduce(queryFilepaths, (memo, path) => {

			memo.push(fileutilities.getFileContents(path));
			return memo;

		}, []);

		return Promise.all(promises)
			.then(_.flatten);

	}

	_executeQueries(queries) {

		du.debug('AuroraSchemaDeployment._executeQueries()');

		return BBPromise.map(queries, this._executeQuery.bind(this));

	}

	_getSeedQueries() {

		du.debug('AuroraSchemaDeployment._getSeedQueries()');

		return this._getDirectorySQLFilepaths('seeds')
			.then((filepaths) => {

				return BBPromise.map(filepaths, fileutilities.getFileContents.bind(this))

			});

	}

	_getDestroyQuery() {

		du.debug('AuroraSchemaDeployment._getDestroyQuery()');

		return Promise.resolve()
			.then(() => this._getTableDropQueries())
			.then((queries) => {

				return BBPromise.each(queries, this._executeQuery.bind(this));

			});

	}

	_getTableDropQueries() {

		du.debug('AuroraSchemaDeployment._getTableDropQueries()');

		return this._getTableFilenames(path.join('snapshot', 'tables')).then((tableFilenames) => {

			return arrayutilities.map(tableFilenames, (tableFilename) => {

				return `DROP TABLE IF EXISTS analytics.${this._getTableNameFromFilename(tableFilename)};`;

			});

		});

	}

	_purgeTableDirectory(directory) {

		du.debug('AuroraSchemaDeployment._purgeTableDirectory()');

		return this._getTableFilenames(directory)
			.then((filenames) => this._getPurgeQueries(filenames))
			.then((queries) => this._executePurgeQueries(queries));

	}

	_executePurgeQueries(queries) {

		du.debug('AuroraSchemaDeployment._executePurgeQueries()');

		if (queries.length < 1) {

			du.highlight('No purge queries to execute');

			return Promise.resolve();

		}

		return this._executeQuery(arrayutilities.compress(queries, ' ', ''));

	}

	_getTableFilenames(directory) {

		du.debug('AuroraSchemaDeployment._getTableFilenames()');

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', path.join('aurora', directory))).then((files) => {

			return files.filter(file => file.match(/\.sql$/));

		});

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

	_getPurgeQueries(tableFilenames) {

		du.debug('AuroraSchemaDeployment._getPurgeQueries()');

		return arrayutilities.map(tableFilenames, (tableFilename) => {

			const table = this._getTableNameFromFilename(tableFilename);

			return `TRUNCATE TABLE analytics.${table};`;

		});

	}

	_getTableNameFromFilename(filename) {

		du.debug('AuroraSchemaDeployment._getTableNameFromFilename()');

		return filename.replace('.sql', '');

	}

}