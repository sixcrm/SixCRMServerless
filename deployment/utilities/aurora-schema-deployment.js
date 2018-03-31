const _ = require('underscore');
const BBPromise = require('bluebird');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

module.exports = class AuroraSchemaDeployment {

	deployTables() {

		du.debug('Deploy Aurora tables');

		return Promise.resolve()
			.then(() => fileutilities.getFileContents(global.SixCRM.routes.path('model', `aurora/before/schema/${process.env.stage}.sql`)))
			.then(this._executeQuery.bind(this))
			.then(() => this._deployDirectorySQL('procedures'))
			.then(() => this._deployDirectorySQL('scripts'))
			.then(() => this._deployDirectorySQL('tables'));

	}

	destroy() {

		du.debug('Destroy');

		return this._getDestroyQuery()
			.then(this._executeQuery.bind(this));

	}

	seed() {

		du.debug('Seed');

		return this._getSeedQueries()
			.then(this._executeQueries.bind(this));

	}

	purge() {

		du.debug('Purge');

		return this._purgeTableDirectory('tables');

	}

	_deployDirectorySQL(directory) {

		du.debug('Deploy Aurora SQL');

		return this._getDirectorySQLFilepaths(directory)
			.then(this._getQueries.bind(this))
			.then(this._executeQueries.bind(this));

	}

	_getDirectorySQLFilepaths(directory) {

		du.highlight('Get Directory SQL Filepaths');

		const directoryFilepath = global.SixCRM.routes.path('model', `aurora/${directory}`);

		return fileutilities.getDirectoryFiles(directoryFilepath).then((files) => {

			const filter = arrayutilities.filter(files, (file) => {

				return file.match(/\.sql$/);

			});

			return arrayutilities.map(filter, (file) => {

				return `${directoryFilepath}/${file}`;

			});

		});

	}

	_getQueries(queryFilepaths) {

		du.debug('Get Queries');

		const promises = _.reduce(queryFilepaths, (memo, path) => {

			memo.push(fileutilities.getFileContents(path));
			return memo;

		}, []);

		return Promise.all(promises)
			.then(_.flatten);

	}

	_executeQueries(queries) {

		du.debug('Execute Queries');

		return BBPromise.map(queries, this._executeQuery.bind(this));

	}

	_getSeedQueries() {

		du.debug('Get Seed Queries');

		return this._getDirectorySQLFilepaths('seeds')
			.then((filepaths) => {

				return BBPromise.map(filepaths, fileutilities.getFileContents.bind(this))

			});

	}

	_getDestroyQuery() {

		du.debug('Get Destroy Query');

		return Promise.resolve()
			.then(() => this._getTableDropQueries())
			.then((queries) => {

				return BBPromise.each(queries, this._executeQuery.bind(this));

			});

	}

	_getTableDropQueries() {

		du.debug('Get Table Drop Queries');

		return this._getTableFilenames('tables').then((tableFilenames) => {

			return arrayutilities.map(tableFilenames, (tableFilename) => {

				return `DROP TABLE IF EXISTS analytics.${this._getTableNameFromFilename(tableFilename)};`;

			});

		});

	}

	_purgeTableDirectory(directory) {

		du.debug('Purge Table Directory');

		return this._getTableFilenames(directory)
			.then((filenames) => this._getPurgeQueries(filenames))
			.then((queries) => this._executePurgeQueries(queries));

	}

	_executePurgeQueries(queries) {

		du.debug('Execute Purge Queries');

		if (queries.length < 1) {

			du.highlight('No purge queries to execute');

			return Promise.resolve();

		}

		return this._executeQuery(arrayutilities.compress(queries, ' ', ''));

	}

	_getTableFilenames(directory) {

		du.debug('Get Table Filenames');

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('model', `aurora/${directory}`)).then((files) => {

			return files.filter(file => file.match(/\.sql$/));

		});

	}

	_executeQuery(query) {

		du.debug('Execute Query', query);

		if (!query) {

			return Promise.resolve();

		}

		return auroraContext.withConnection((connection => {

			return connection.query(query);

		}));

	}

	_getPurgeQueries(tableFilenames) {

		du.highlight('Get Purge Queries');

		return arrayutilities.map(tableFilenames, (tableFilename) => {

			const table = this._getTableNameFromFilename(tableFilename);

			return `TRUNCATE TABLE analytics.${table};`;

		});

	}

	_getTableNameFromFilename(filename) {

		du.debug('Get Table Name From Filename');

		return filename.replace('.sql', '');

	}

}