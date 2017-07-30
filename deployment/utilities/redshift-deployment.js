'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class RedshiftDeployment extends AWSDeploymentUtilities {

  constructor() {

    super();

    this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

    this.redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

  }

  deployTablesDirectory(directory) {

    return this.getTableFilenames(directory)
      .then((filenames) => this.collectQueries(filenames, directory))
      .then((query) => this.execute(query))
      .then((result) => {

        du.info(result);

        return 'Complete';

      });

  }

  deployTables() {

    du.debug('Deploy Redshift tables');

    let directory_list = ['schemas', 'system', 'tables']

    let directory_deployment_promises = arrayutilities.map(directory_list, (directory) => {

      du.highlight('Deploy tables ' + directory);

      return () => this.deployTablesDirectory(directory);
    });

    return arrayutilities.serial(
      directory_deployment_promises
    ).then(() => {
      return 'Complete';
    });


  }

  purgeTables(){

    du.debug('Purge tables');

    let directory_list = ['tables']

    let directory_purge_promises = arrayutilities.map(directory_list, (directory) => {

      du.highlight('Deploy tables ' + directory);

      return () => this.purgeTableDirectory(directory);
    });

    return arrayutilities.serial(
      directory_purge_promises
    ).then(() => {
      return 'Complete';
    });

  }

  purgeTableDirectory(directory){
    return this.getTableFilenames(directory)
      .then((filenames) => this.collectPurgeQueries(filenames))
      .then((query) => this.execute(query))
      .then((result) => {

        du.info(result);

        return 'Complete';

      });
  }

  execute(query) {

    du.debug('Execute');

    return this.redshiftqueryutilities.query(query.join(';'));

  }

  getTableFilenames(directory) {

    du.debug('Get Redshift Table Names');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('model', 'redshift/' + directory)).then((files) => {

      files = files.filter(file => file.match(/\.sql$/));

      return files;

    });

  }

  collectQueries(table_filenames, directory) {

    du.debug('Collect Queries');

    let path_to_model = global.SixCRM.routes.path('model', 'redshift/' + directory + '/');

    this.redshiftqueryutilities.instantiateRedshift();

    let query_promises = arrayutilities.map(table_filenames, (filename) => {
      return this.collectQueryFromPath(path_to_model + filename, filename)
    });

    return this.redshiftqueryutilities.openConnection().then(() => {
      return Promise.all(query_promises).then((query_promises) => {
        this.redshiftqueryutilities.closeConnection();
        return query_promises;
      });
    });

  }

  collectPurgeQueries(table_filenames) {

    du.debug('Generate Truncate Table Queries');

    return arrayutilities.map(table_filenames, table_name => '\TRUNCATE TABLE ' + table_name.replace('.sql', '') + ';').join('');

  }

  collectQueryFromPath(path, filename) {

    let version_promises = [
      this.getTableVersion(filename),
      this.getVersionNumberFromFile(path)
    ];

    return Promise.all(version_promises).then((version_promise) => {

      let database_version = version_promise[0];
      let file_version = version_promise[1];
      let query = '';

      du.debug('Filename: ' + filename, 'Database Version Number: ' + database_version, 'File Version Number ' + file_version);

      if (database_version < file_version || !path.match('tables')) {

        let content = fileutilities.getFileContentsSync(path);

        query = '' + content + ';';

      }

      return query;
    }).catch(error => {
      du.error(error);
    });

  }

  getVersionNumberFromFile(path) {

    du.debug('Get Version Number From File');

    let file_contents = fileutilities.getFileContentsSync(path);

    let file_contents_array = file_contents.split('\n');

    let version_number = arrayutilities.filter(file_contents_array, (line) => {
      return line.match(/TABLE_VERSION/);
    });

    return mathutilities.toNumber(version_number.toString().replace(/[^0-9]/g, ''));

  }

  getTableVersion(filename) {

    du.debug('Get Table Version ' + filename);

    let table_name = filename.replace('.sql', '');

    let version_query = '\
        SELECT \
          version \
        FROM  \
          sys_sixcrm.sys_table_version \
        WHERE \
          table_name = \'' + table_name + '\'';


    return this.redshiftqueryutilities.queryRaw(version_query).then(result => {

      du.debug('Got response table_name ', table_name)
      if (result && result.length > 0) {
        return result[0].version;
      }
      return 0;
    });

  }

  deleteClusterAndWait() {

    return this.redshiftutilities.deleteCluster().then(() => {
      return this.redshiftutilities.waitForCluster('clusterDeleted');
    });

  }

  createClusterAndWait() {

    return this.redshiftutilities.createCluster().then(() => {
      return this.redshiftutilities.waitForCluster('clusterAvailable');
    });

  }

  destroyCluster() {

    return this.redshiftutilities.clusterExists().then(exists => {

      if (!exists) {

        return Promise.resolve('Cluster does not exist, aborting.');

      } else {

        du.output('Cluster exists, destroying.');

        return this.deleteClusterAndWait().then(() => {

          return 'Cluster destroyed.';

        });

      }

    });

  }

  deployCluster() {

    return this.redshiftutilities.clusterExists().then(exists => {

      if (exists) {

        return Promise.resolve('Cluster exists, aborting.');

      } else {

        du.output('Cluster does not exist, creating.');

        return this.createClusterAndWait().then(() => {

          return 'Cluster created.';

        });

      }

    });

  }

}

module.exports = new RedshiftDeployment();
