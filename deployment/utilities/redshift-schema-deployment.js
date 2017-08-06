'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const RedshiftDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-deployment.js');

class RedshiftSchemaDeployment extends RedshiftDeployment {

  constructor() {

    super();

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

  deployNonVersionedTables(){

    du.debug('Deploy Non-Versioned Tables');

    let deployment_promises = arrayutilities.map(this.non_versioned_table_direcotries, (directory) => {

      return this.deployDirectorySQL(directory, false);

    });

    return Promise.all(deployment_promises);

  }

  deployVersionedTables(){

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
        return directory_filepath+'/'+file;
      });

      return files;

    });

  }

  getQueries(query_filepaths, versioned) {

    du.debug('Get Queries');

    let query_promises = arrayutilities.map(query_filepaths, (filepath) => {
      return () => this.getQueryFromPath(filepath, versioned);
    });

    return arrayutilities.serial(query_promises, (query_promises) => {
      return query_promises;
    });

  }

  getQueryFromPath(filepath, versioned) {

    du.debug('Get Query From Path');

    if(_.isUndefined(versioned)){ versioned = true; }

    return fileutilities.getFileContents(filepath).then((file_contents) => {

      let query = file_contents + ';';

      if (!versioned) {

        du.highlight('Non-versioned query: ', query);

        return Promise.resolve(query);
      }

      return this.determineTableVersion(filepath).then((versions) => {

          let version_in_database = versions[0];
          let local_version = versions[1];

          du.debug(
              'filepath: ' + filepath,
              'Database Version Number: ' + version_in_database,
              'File Version Number ' + local_version);

              process.exit();

          if (version_in_database < local_version) {

              return Promise.resolve(query);

          }

          return Promise.resolve('');

      });

    });

  }

  executeQueries(queries){

    du.debug('Execute Queries');

    return Promise.resolve(true);

  }


  purgeTables(){

     du.debug('Purge tables');

     let directory_list = ['tables'];

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
    .then((filenames) => this.getPurgeQueries(filenames))
    .then((query) => this.execute(query))
    .then((result) => {

      du.info(result);

      return 'Complete';

    });
  }

  execute(query) {

    du.debug('Execute ');

    return this.redshiftqueryutilities.query(query);

  }

  getPurgeQueries(table_filenames) {

    du.highlight('Get Purge Queries');

    return arrayutilities.map(table_filenames, table_name => '\TRUNCATE TABLE ' + table_name.replace('.sql', '') + ';').join('');

  }

  determineTableVersion(filepath) {

    du.debug('Determine Table Version');

    let filename = fileutilities.getFilenameFromPath(filepath);

    let version_promises = [
      this.getRemoteTableVersion(filename),
      this.getVersionNumberFromFile(filepath)
    ];

    return Promise.all(version_promises).then(version_promises => {

      du.info(version_promises);
      process.exit();

      return version_promises;

    });

  }

  getVersionNumberFromFile(filepath) {

    du.debug('Get Version Number From File');

    return fileutilities.getFileContents(filepath).then(file_contents => {

      let file_contents_array = file_contents.split('\n');

      let version_number = arrayutilities.filter(file_contents_array, (line) => {
        return line.match(/TABLE_VERSION/);
      });

      if(version_number.length > 0){

        version_number = mathutilities.toNumber(version_number.pop().replace(/[^0-9]/g, ''));

        return version_number;

      }else{

        return null;

      }

    });

  }

  getRemoteTableVersion(filename) {

    du.debug('Get Remote Table Version');

    let table_name = filename.replace('.sql', '');

    let version_query = '\
        SELECT \
          version \
        FROM  \
          sys_sixcrm.sys_table_version \
        WHERE \
          table_name = \'' + table_name + '\'';

    //Fix this!
    return this.redshiftqueryutilities.queryRaw(version_query).then(result => {

      du.debug('Got response table_name ', table_name);
      if (result && result.length > 0) {
        return result[0].version;
      }
      return 0;
    });

  }

}

module.exports = new RedshiftSchemaDeployment();
