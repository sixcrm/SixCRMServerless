'use strict';

const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

class AuroraSchemaDeployment {

  constructor() {

    this.table_directories = ['schemas', 'tables'];

  }

  deployTables() {

    du.debug('Deploy Aurora tables');

    let deployment_promises = arrayutilities.map(this.table_directories, (directory) => {

      return () => this.deployDirectorySQL(directory);

    });

    return arrayutilities.serial(deployment_promises).then(() => {

      return true;

    }).then(() => {

      return 'Complete';

    });

  }

  deployDirectorySQL(directory) {

    du.debug('Deploy Aurora SQL');

    return this.getDirectorySQLFilepaths(directory)
      .then((filepaths) => this.getQueries(filepaths))
      .then((queries) => this.executeQueries(queries))
      .then((result) => {

        return result;

      });

  }

  getDirectorySQLFilepaths(directory) {

    du.highlight('Get Directory SQL Filepaths');

    let directory_filepath = global.SixCRM.routes.path('model', 'aurora/' + directory);

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

  getQueries(queryFilepaths) {

    du.debug('Get Queries');

    let queries = [];

    let query_promises = arrayutilities.map(queryFilepaths, (filepath) => {
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

    let schema_drop_queries_promise = this.getSchemaDropQueries();

    return Promise.all([
      table_drop_queries_promise,
      schema_drop_queries_promise
    ]).then((resolved_promises) => {

      let table_drop_queries = resolved_promises[0];
      let schema_drop_queries = resolved_promises[1];

      arrayutilities.isArray(table_drop_queries, true);
      arrayutilities.isArray(schema_drop_queries, true);

      let merged_queries_array = [];

      if (table_drop_queries.length > 0) {
        merged_queries_array = arrayutilities.merge(merged_queries_array, table_drop_queries);
      }

      if (schema_drop_queries.length > 0) {
        merged_queries_array = arrayutilities.merge(merged_queries_array, schema_drop_queries);
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

  getSchemaDropQueries() {

    du.debug('Get Schema Drop Queries');

    return this.getTableFilenames('schemas').then((schema_filenames) => {

      return arrayutilities.map(schema_filenames, (schema_filename) => {

        let schema_name = this.getTableNameFromFilename(schema_filename);

        return 'DROP SCHEMA IF EXISTS ' + schema_name + ' CASCADE;';

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
      eu.throwError('server', 'Not an array: ' + queries);
    }

    if (queries.length < 1) {

      du.highlight('No purge queries to execute');
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

    if (_.contains(['local', 'local-docker', 'circle'], global.SixCRM.configuration.stage)) { // Technical Debt: This REALLY shouldn't be hardcoded here.
      query = this.transformQuery(query);
      du.info(query);
    }

    return auroraContext.withConnection((connection => {

      return connection.query(query).then(result => result.rows);

    }));

  }

  getPurgeQueries(table_filenames) {

    du.highlight('Get Purge Queries');

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

  getTableNameFromFilename(filename){

    du.debug('Get Table Name From Filename');

    return filename.replace('.sql', '');

  }

}

module.exports = new AuroraSchemaDeployment();
