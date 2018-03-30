const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');
const BBPromise = require('bluebird');

module.exports = class AuroraSchemaDeployment {

	constructor() {

		this._tableDirectories = ['tables'];
		this._procedureDirectories = ['procedures'];
		this._scriptsDirectories = ['scripts'];

	}

	deployTables() {

		du.debug('Deploy Aurora tables');

		const procedurePromises = arrayutilities.map(this._procedureDirectories, this._deployDirectorySQL.bind(this));
		const tablePromises = arrayutilities.map(this._tableDirectories, this._deployDirectorySQL.bind(this));
		const scriptPromises = arrayutilities.map(this._scriptsDirectories, this._deployDirectorySQL.bind(this));

		return Promise.resolve()
			.then(() => fileutilities.getFileContents(global.SixCRM.routes.path('model', `aurora/before/schema/${process.env.stage}.sql`)))
			.then(this._executeQuery.bind(this))
			.then(() => BBPromise.each(procedurePromises, (p) => p))
			.then(() => Promise.all(scriptPromises))
			.then(() => Promise.all(tablePromises));

	}

	destroy() {

		du.debug('Destroy');

		return this._getDestroyQuery()
			.then(this._executeQuery.bind(this));

	}

	seed() {

		du.debug('Seed');

		return this._getSeedQueries()
			.then((seed_queries) => {

				arrayutilities.isArray(seed_queries, true);

				if (seed_queries.length > 0) {

					return this._executeQueries(seed_queries);

				}

				return Promise.resolve();

			});

	}

	purge() {

		du.debug('Purge');

		const directoryPurgePromises = arrayutilities.map(this._tableDirectories, this._purgeTableDirectory.bind(this));

		return Promise.all(directoryPurgePromises);

	}

	_deployDirectorySQL(directory) {

		du.debug('Deploy Aurora SQL');

		return this._getDirectorySQLFilepaths(directory)
			.then(this._getQueries.bind(this))
			.then(this._executeQueries.bind(this));

	}

	_getDirectorySQLFilepaths(directory) {

		du.highlight('Get Directory SQL Filepaths');

		const directoryFilepath = global.SixCRM.routes.path('model', 'aurora/' + directory);

		return fileutilities.getDirectoryFiles(directoryFilepath).then((files) => {

			files = arrayutilities.filter(files, (file) => {

				return file.match(/\.sql$/);

			});

			files = arrayutilities.map(files, (file) => {

				return directoryFilepath + '/' + file;

			});

			return files;

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

		const queryPromises = arrayutilities.map(queries, (query) => {

			if (!_.isNull(query) && query !== '' && query !== false) {

				return this._executeQuery(query);

			}

			return Promise.resolve();

		});

		return Promise.all(queryPromises);

	}

	_getSeedQueries() {

		du.debug('Get Seed Queries');

		return this._getDirectorySQLFilepaths('seeds').then((filepaths) => {

			let queryPromises = arrayutilities.map((filepaths), (filepath) => {

				return fileutilities.getFileContents(filepath);

			});

			return Promise.all(queryPromises);

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

		return this._getTableFilenames('tables').then((table_filenames) => {

			return arrayutilities.map(table_filenames, (table_filename) => {

				return 'DROP TABLE IF EXISTS analytics.' + this._getTableNameFromFilename(table_filename) + ';';

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

		if (!_.isArray(queries)) {

			eu.throwError('server', 'Not an array: ' + queries);

		}

		if (queries.length < 1) {

			du.highlight('No purge queries to execute');

			return Promise.resolve();

		}

		return this._executeQuery(arrayutilities.compress(queries, ' ', ''));

	}

	_getTableFilenames(directory) {

		du.debug('Get Table Filenames');

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('model', 'aurora/' + directory)).then((files) => {

			return files.filter(file => file.match(/\.sql$/));

		});

	}

	_executeQuery(query) {

		du.debug('Execute Query');

		return auroraContext.withConnection((connection => {

			return connection.query(query).then(result => {

				return result.rows;

			});

		}));

	}

	_getPurgeQueries(tableFilenames) {

		du.highlight('Get Purge Queries');

		return arrayutilities.map(tableFilenames, (tableFilename) => {

			const table = this._getTableNameFromFilename(tableFilename);

			return 'TRUNCATE TABLE analytics.' + table + ';';

		});

	}

	_getTableNameFromFilename(filename) {

		du.debug('Get Table Name From Filename');

		return filename.replace('.sql', '');

	}

}