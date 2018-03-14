'use strict';

const _ = require('underscore');
const fs = require('fs');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const RedshiftDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-deployment.js');
const redshiftContext = global.SixCRM.routes.include('lib', 'analytics/redshift-context.js');

class RedshiftSchemaDeployment extends RedshiftDeployment {

  constructor() {

    super();

    this.non_versioned_table_direcotries = ['schemas', 'system'];

    this.versioned_table_directories = ['tables'];

  }

  deployTables() {

    du.debug('Deploy Redshift tables');

    //Note:  Aldo, please see structure herein
    return this.deployNonVersionedTables()
      .then(() => this.deployVersionedTables())
      .then(() => {
        return 'Complete';
      });

  }

  deployNonVersionedTables() {

    du.debug('Deploy Non-Versioned Tables');

    let deployment_promises = arrayutilities.map(this.non_versioned_table_direcotries, (directory) => {

      return () => this.deployDirectorySQL(directory, false);

    });

    return arrayutilities.serial(deployment_promises).then(() => {
      return true;
    });

  }

  deployVersionedTables() {

    du.debug('Deploy Versioned Tables');

    let deployment_promises = arrayutilities.map(this.versioned_table_directories, (directory) => {

      return this.deployDirectorySQL(directory);

    });

    return Promise.all(deployment_promises);

  }

  deployDirectorySQL(directory, versioned) {

    du.debug('Deploy Directory SQL');

    return this.getDirectorySQLFilepaths(directory)
      .then((filepaths) => this.getQueries(filepaths, versioned))
      .then((queries) => this.executeQueries(queries))
      .then((result) => {

        return result;

      });

  }

  getDirectorySQLFilepaths(directory) {

    du.highlight('Get Directory SQL Filepaths');

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

  getQueries(query_filepaths, versioned) {

    du.debug('Get Queries');

    let queries = [];

    let query_promises = arrayutilities.map(query_filepaths, (filepath) => {
      return () => this.getQueryFromPath(filepath, versioned).then((query) => {
        queries.push(query);
        return true;
      });
    });

    return arrayutilities.serial(query_promises).then(() => {
      return queries;
    })

  }

  getQueryFromPath(filepath, versioned) {

    du.debug('Get Query From Path');

    if (_.isUndefined(versioned)) {
      versioned = true;
    }

    return fileutilities.getFileContents(filepath).then((query) => {

      if (!versioned) {

        du.highlight('Non-versioned query: ');
        du.info(query);

        return Promise.resolve(query);

      }

      return this.determineTableVersion(filepath).then((versions) => {

        let version_in_database = versions[0];
        let local_version = versions[1];

        du.debug(
          'filepath: ' + filepath,
          'Database Version Number: ' + version_in_database,
          'File Version Number ' + local_version);

        if (version_in_database < local_version) {

          return Promise.resolve(query);

        }

        return Promise.resolve('');

      });

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

  seed_referential() {

    du.debug('Seed Referential data');

    return this.seedDateDatabase()
      .then(() => {
        return 'Complete';
      });

  }

  seedDateDatabase() {

    du.debug('Seed Date Database');

    return this.uploadDateDatabaseToS3().then(() => {
      return this.copyDateDatabaseToRedshift()
    });

  }

  uploadDateDatabaseToS3() {

    du.debug('Upload Date Database');

    let database_filename = 'd_datetime.csv';
    let parameters = {
      Bucket: 'sixcrm-' + global.SixCRM.configuration.stage + '-redshift',
      Key: database_filename
    };

    return s3utilities.objectExists(parameters).then((exists) => {

      if (exists) {

        du.debug('Datetime database already exists on S3, skipping.');

        return Promise.resolve();

      } else {

        du.debug('Uploading Date Database to S3 bucket.');

        parameters['Body'] = fs.createReadStream(global.SixCRM.routes.path('model', 'redshift/seed_referential/' + database_filename));

        return s3utilities.putObject(parameters);

      }

    });

  }

  copyDateDatabaseToRedshift() {

    du.debug('Copy Date Database');

    let parse_parameters = {
      stage: process.env.stage,
      aws_account_id: global.SixCRM.configuration.getAccountIdentifier()
    };

    let query_copy = `
      TRUNCATE TABLE d_datetime;
      COPY d_datetime
      FROM 's3://sixcrm-{{stage}}-redshift/d_datetime.csv'
      credentials 'aws_iam_role=arn:aws:iam::{{aws_account_id}}:role/sixcrm_redshift_copy_role'
      DELIMITER ',';`;

    query_copy = parserutilities.parse(query_copy, parse_parameters);

    du.info(query_copy);

    return this.execute(query_copy);

  }

  getSeedQueries() {

    du.debug('Get Seed Queries');

    return this.getDirectorySQLFilepaths('seeds').then((filepaths) => {

      let query_promises = arrayutilities.map((filepaths), (filepath) => {

        return this.getQueryFromPath(filepath, false);

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

    let directory_purge_promises = arrayutilities.map(this.versioned_table_directories, (directory) => {

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

    return redshiftContext.withConnection((connection => {

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

}

module.exports = new RedshiftSchemaDeployment();
