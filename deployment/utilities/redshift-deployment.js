'use strict';

const _ = require('underscore');
//const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const fileutilities = global.routes.include('lib', 'file-utilities.js');
const objectutilities = global.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');
const mathutilities = global.routes.include('lib', 'math-utilities.js');

module.exports = class RedshiftDeployment{

    constructor(stage) {

        this.stage = configurationutilities.resolveStage(stage);

        process.env.stage = this.stage;

        this.site_config = configurationutilities.getSiteConfig(this.stage);

        this.redshiftqueryutilities = global.routes.include('lib', 'redshift-query-utilities.js');

        this.redshiftutilities = global.routes.include('lib', 'redshift-utilities.js');

    }

    deployTables(){

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

      return this.redshiftqueryutilities.query(query);

    }

    getTableFilenames(){

      du.debug('Get Redshift Table Names');

      return fileutilities.getDirectoryFiles(global.routes.path('model', 'redshift')).then((files) => {

        files = files.filter(file => file.match(/\.sql$/));

        //Technical Debt:  (Aldo) Why does this matter?
        files.sort();

        return files;

      });

    }

    collectQueries(table_filenames) {

      let directory = global.routes.path('model', 'redshift');

      this.redshiftqueryutilities.instantiateRedshift();

      //Technical Debt:  Use Array Utilities method.
      //Technical Debt:  This is clumsy...
      let query_promises = table_filenames.map((filename) => this.collectQueryFromPath(directory+'/'+filename, filename));

      //Finish

    }

    collectQueryFromPath(path, filename) {

      let version_promises = [
        this.getTableVersion(filename),
        this.getVersionNumberFromFile(path)
      ];

      return Promise.all(version_promises).then((version_promises) => {

        let database_version = version_promises[0];
        let file_version = version_promises[0];

        du.info('Filename: '+ filename, 'Database Version Number: '+database_version, 'File Version Number '+file_version);

        //Technical Debt:  Why do we care if the file starts with a digit?
        if (database_version < file_version || filename.match(/^[0-9]/)) {

          let content = fileutilities.getFileContentsSync(path);


          //what's this?
          //query += `${content};`;

        }

        return true;

      });

    }

    getVersionNumberFromFile(path) {

      du.highlight('Get Version Number From File');

      let file_contents = fileutilities.getFileContentsSync(path);

      let file_contents_array = file_contents.split('\n');

      let version_number = arrayutilities.filter(file_contents_array, (line) => {
        return line.match(/TABLE_VERSION/).toString().replace(/[^0-9]/g,'');
      });

      return mathutilities.toNumber(version_number);

    }

    getTableVersion(filename) {

      du.highlight('Get Table Version');

      let table_name = filename.replace('.sql', '');

      let version_query = '\
        SELECT \
          version \
        FROM  \
          sys_sixcrm.sys_table_version \
        WHERE \
          table_name = "'+table_name+'"';

      return this.redshiftqueryutilities.queryRaw(version_query).then(result => {

          if (result && result.length > 0) {
              return result[0].version;
          }

          return 0;

      });

    }

    createCluster() {

      let parameters = this.createParametersObject('create');

      return new Promise((resolve, reject) => {
          this.redshift.createCluster(parameters, (error, data) => {
              if (error) {
                  du.error(error.message);
                  return reject(error);
              } else {
                  return resolve(data);
              }
          });
      });

    }

    deleteClusterAndWait() {

        return this.deleteCluster().then(() => {
            return this.waitForCluster('clusterDeleted');
        });

    }

    createClusterAndWait() {

        return this.createCluster().then(() => {
            return this.waitForCluster('clusterAvailable');
        });

    }


    destroyCluster(){

      return this.clusterExists().then(exists => {

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

    deployCluster(){

      //du.output('Cluster parameters:', this.site_config.redshift.cluster);

      return this.clusterExists().then(exists => {

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
