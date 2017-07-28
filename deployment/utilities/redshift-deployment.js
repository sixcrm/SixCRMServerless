'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class RedshiftDeployment extends AWSDeploymentUtilities{

  constructor() {

    super();

    this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

    this.redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

  }

  deployTables() {

    return this.getTableFilenames()
    .then((filenames) => this.collectQueries(filenames))
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

  getTableFilenames() {

    du.debug('Get Redshift Table Names');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('model', 'redshift')).then((files) => {

      files = files.filter(file => file.match(/\.sql$/));

      //  Technical Debt:  (Aldo) Why does this matter?
      //  A.Zelen It's here because we need the model to be deployed in certain order (1,2 go first)

      files.sort();

      return files;

    });

  }

  collectQueries(table_filenames) {

    du.debug('Collect Queries');

    let path_to_model = global.SixCRM.routes.path('model', 'redshift');

    this.redshiftqueryutilities.instantiateRedshift();

    // Technical Debt:  This is clumsy...
    // A.Zelen Need sugestion

    let query_promises = arrayutilities.map(table_filenames, (filename) => {
      return this.collectQueryFromPath(path_to_model+'/'+filename, filename)
    });

    return this.redshiftqueryutilities.openConnection().then(() => {
        return Promise.all(query_promises).then((query_promises) => {
            this.redshiftqueryutilities.closeConnection();
            return query_promises;
        });
      });

  }

  collectQueryFromPath(path, filename) {

    let version_promises = [
      this.getTableVersion(filename),
      this.getVersionNumberFromFile(path)
    ];

    return Promise.all(version_promises).then((version_promises) => {

      let database_version = version_promises[0];
      let file_version = version_promises[1];
      let query = '';

      du.debug('Filename: ' + filename, 'Database Version Number: ' + database_version, 'File Version Number ' + file_version);

      // Technical Debt:  Why do we care if the file starts with a digit?
      // A.Zelen If the table starts with a digit then it will always execute
      if (database_version < file_version || filename.match(/^[0-9]/)) {

        let content = fileutilities.getFileContentsSync(path);

        // what's this?
        // A.Zelen Construction of a table deploy query, tables with not changed versions are skiped

        query = ''+content+';';

      }

      return query;
    }).catch(e => {
      du.error(e);
    });
  }

  getVersionNumberFromFile(path) {

    du.highlight('Get Version Number From File');

    let file_contents = fileutilities.getFileContentsSync(path);

    let file_contents_array = file_contents.split('\n');

    let version_number = arrayutilities.filter(file_contents_array, (line) => {
      return line.match(/TABLE_VERSION/);
    });

    return mathutilities.toNumber(version_number.toString().replace(/[^0-9]/g, ''));

  }

  getTableVersion(filename) {

    du.highlight('Get Table Version ' + filename);

    let table_name = filename.replace('.sql', '');

    let version_query = '\
        SELECT \
          version \
        FROM  \
          sys_sixcrm.sys_table_version \
        WHERE \
          table_name = \'' + table_name + '\'';


    return this.redshiftqueryutilities.queryRaw(version_query).then(result => {

      du.highlight('Got response table_name ', table_name)
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
