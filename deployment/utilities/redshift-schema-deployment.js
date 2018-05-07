const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const RedshiftDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-deployment.js');
const redshiftContext = global.SixCRM.routes.include('lib', 'analytics/redshift-context.js');

module.exports = class RedshiftSchemaDeployment extends RedshiftDeployment {

	constructor() {

		super();

		this.table_directories = ['tables'];

	}

	deployTables() {

		du.debug('Deploy Redshift tables');

		//Note:  Aldo, please see structure herein
		return this.deployNonVersionedTables()
			.then(() => {
				return 'Complete';
			});

	}

	deployNonVersionedTables() {

		du.debug('Deploy Non-Versioned Tables');

		let deployment_promises = arrayutilities.map(this.table_directories, (directory) => {

			return () => this.deployDirectorySQL(directory);

		});

		return arrayutilities.serial(deployment_promises).then(() => {
			return true;
		});

	}

	deployDirectorySQL(directory) {

		du.debug('Deploy Directory SQL');

		return this.getDirectorySQLFilepaths(directory)
			.then((filepaths) => this.getQueries(filepaths))
			.then((queries) => this.executeQueries(queries))
			.then((result) => {

				return result;

			});

	}

	getDirectorySQLFilepaths(directory) {

		du.info('Get Directory SQL Filepaths');

		let directory_filepath = global.SixCRM.routes.path('model', 'redshift/' + directory);

		return fileutilities.getDirectoryFiles(directory_filepath).then((files) => {

			files = arrayutilities.filter(files, (file) => {
				return file.match(/\.sql$/);
			});

			files = arrayutilities.map(files, (file) => {
				return directory_filepath + '/' + file;
			});

			return files;

		});

	}

	getQueries(query_filepaths) {

		du.debug('Get Queries');

		let queries = [];

		let query_promises = arrayutilities.map(query_filepaths, (filepath) => {
			return () => this.getQueryFromPath(filepath).then((query) => {
				queries.push(query);
				return true;
			});
		});

		return arrayutilities.serial(query_promises).then(() => {
			return queries;
		})

	}

	getQueryFromPath(filepath) {

		du.debug('Get Query From Path');

		return fileutilities.getFileContents(filepath).then((query) => {

			return Promise.resolve(query);

		});

	}

	executeQueries(queries) {

		du.debug('Execute Queries');

		let query_promises = arrayutilities.map(queries, (query) => {

			if (!_.isNull(query) && query !== '' && query !== false) {

				return () => this.execute(query);

			}

			return () => {
				return Promise.resolve(null);
			};

		});

		return arrayutilities.serial(query_promises).then(() => {

			return true;

		});

	}

	destroy() {

		du.debug('Destroy');

		return this.getDestroyQuery()
			.then((destroy_query) => this.execute(destroy_query))
			.then(() => {

				return 'Complete';

			});

	}

	seed() {

		du.debug('Seed');

		return this.getSeedQueries()
			.then((seed_queries) => {
				arrayutilities.isArray(seed_queries, true);
				if (seed_queries.length > 0) {
					return this.executeQueries(seed_queries);
				}
				return Promise.resolve(true);
			})
			.then(() => {
				return 'Complete';
			});

	}

	getSeedQueries() {

		du.debug('Get Seed Queries');

		return this.getDirectorySQLFilepaths('seeds').then((filepaths) => {

			let query_promises = arrayutilities.map((filepaths), (filepath) => {

				return this.getQueryFromPath(filepath);

			});

			return Promise.all(query_promises);

		});

	}

	getDestroyQuery() {

		du.debug('Get Destroy Query');

		let table_drop_queries_promise = this.getTableDropQueries();

		return Promise.all([
			table_drop_queries_promise
		]).then((resolved_promises) => {

			let table_drop_queries = resolved_promises[0];

			arrayutilities.isArray(table_drop_queries, true);

			let merged_queries_array = [];

			if (table_drop_queries.length > 0) {
				merged_queries_array = arrayutilities.merge(merged_queries_array, table_drop_queries);
			}

			if (merged_queries_array.length > 0) {
				return arrayutilities.compress(merged_queries_array, ' ', '');
			}


			return null;

		});

	}

	getTableDropQueries() {

		du.debug('Get Table Drop Queries');

		return this.getTableFilenames('tables').then((table_filenames) => {

			return arrayutilities.map(table_filenames, (table_filename) => {

				let table_name = this.getTableNameFromFilename(table_filename);

				return 'DROP TABLE IF EXISTS ' + table_name + ';';

			});

		});

	}

	purge() {

		du.debug('Purge');

		let directory_purge_promises = arrayutilities.map(this.table_directories, (directory) => {

			return () => this.purgeTableDirectory(directory);

		});

		return arrayutilities.serial(
			directory_purge_promises
		).then(() => {
			return 'Complete';
		});

	}

	purgeTableDirectory(directory) {

		du.debug('Purge Table Directory');

		return this.getTableFilenames(directory)
			.then((filenames) => this.getPurgeQueries(filenames))
			.then((queries) => this.executePurgeQueries(queries))
			.then(() => {

				return 'Complete';

			});

	}

	executePurgeQueries(queries) {

		du.debug('Execute Purge Queries');

		if (!_.isArray(queries)) {
			throw eu.getError('server', 'Not an array: ' + queries);
		}

		if (queries.length < 1) {

			du.info('No purge queries to execute');
			return Promise.resolve(false);

		}

		let purge_query = arrayutilities.compress(queries, ' ', '');

		return this.execute(purge_query);

	}

	getTableFilenames(directory) {

		du.debug('Get Table Filenames');

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('model', 'redshift/' + directory)).then((files) => {

			files = files.filter(file => file.match(/\.sql$/));

			return files;

		});

	}

	execute(query) {

		du.debug('Execute Query');

		if (_.includes(['local', 'local-docker', 'circle'], global.SixCRM.configuration.stage)) { // Technical Debt: This REALLY shouldn't be hardcoded here.
			query = this.transformQuery(query);
			du.info(query);
		}

		return redshiftContext.withConnection((connection => {

			return connection.query(query).then(result => result.rows);

		}));

	}

	getPurgeQueries(table_filenames) {

		du.info('Get Purge Queries');

		return arrayutilities.map(table_filenames, (table_filename) => {

			let table_name = this.getTableNameFromFilename(table_filename);

			return 'TRUNCATE TABLE ' + table_name + ';';

		});

	}

	transformQuery(query) {
		/* Transforms query to PostgreSQL format by clearing Redshift specifics */

		return arrayutilities.map(query.split(/\r?\n/), (data) =>
			data.replace(/(getdate.*|integer identity.*|DISTSTYLE.*|DISTKEY.*|INTERLEAVED.*|SORTKEY.*|COMPOUND.*|encode[A-Za-z0-9 ]*|ENCODE[A-Za-z0-9 ]*)(\,)?/, (match, p1, p2) => { // eslint-disable-line no-useless-escape

				if (p2 === ',') {
					return `${p2}`;
				} else if (p1.startsWith('encode')) {
					return ''
				} else if (p1.startsWith('ENCODE')) {
					return ''
				} else if (p1.startsWith('getdate')) {
					return 'now();'
				} else if (p1.startsWith('integer identity')) {
					return 'serial ,'
				}
				else {
					return ';'
				}

			})
		).join('\n');

	}

}
