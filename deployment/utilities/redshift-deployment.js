'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class RedshiftDeployment extends AWSDeploymentUtilities {

  constructor() {

    super();

    this.redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

    this.redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

    this.purge_directory_list = ['tables'];

    this.configFile = this.loadLocalConfig();

  }

  loadLocalConfig() {
    return JSON.parse(fileutilities.getFileContentsSync(global.SixCRM.routes.path('deployment', 'redshift/config/master.json')))
  }

  deployTables() {

    du.debug('Deploy Redshift tables');

    return this.executeSQLDirectory('schemas', false)
      .then(() => this.executeSQLDirectory('system', false))
      .then(() => this.executeSQLDirectory('tables'))
      .then(() => {
        return 'Complete';
      });

  }

  executeSQLDirectory(directory, versioned) {

    du.debug('Execute SQL Directory');
    du.highlight('Directory: ' + directory);

    return this.getTableFilenames(directory)
      .then((filenames) => this.collectQueries(filenames, directory, versioned))
      .then((query) => this.execute(query))
      .then((result) => {

        return result;

      });

  }

  destroyTables(){

    du.debug('Drop tables');

    let directory_drop_promises = arrayutilities.map(this.purge_directory_list, (directory) => {

      du.highlight('Drop tables ' + directory);

      return this.dropTableDirectory(directory);
    });

    return Promise.all(directory_drop_promises);

  }

  purgeTables() {

    du.debug('Purge tables');

    let directory_purge_promises = arrayutilities.map(this.purge_directory_list, (directory) => {

      du.highlight('Purge tables ' + directory);

      return this.purgeTableDirectory(directory);
    });

    return Promise.all(directory_purge_promises);

  }

  purgeTableDirectory(directory) {
    return this.getTableFilenames(directory)
      .then((filenames) => this.generateQueries(filenames,'TRUNCATE'))
      .then((query) => this.execute(query))
      .then((result) => {

        du.info(result);

        return 'Complete';

      }).catch((error) => du.error(error));
  }

  dropTableDirectory(directory) {
    return this.getTableFilenames(directory)
      .then((filenames) => this.generateQueries(filenames,'DROP'))
      .then((query) => this.execute(query))
      .then((result) => {

        du.info(result);

        return 'Complete';

      }).catch((error) => du.error(error));
  }

  seedTables() {

    du.debug('Seed Redshift tables');

    return this.executeSQLDirectory('seeds',false)
      .then(() => {
        return 'Complete';
      });

  }

  execute(query) {

    du.debug('Execute');

    return this.redshiftqueryutilities.query(query.join(''));

  }

  getTableFilenames(directory) {

    du.highlight('Get Redshift Table Names');

    return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('model', 'redshift/' + directory)).then((files) => {

      files = files.filter(file => file.match(/\.sql$/));

      return files;

    });

  }

  collectQueries(table_filenames, directory, versioned) {

    du.debug('Collect Queries');

    let path_to_model = global.SixCRM.routes.path('model', 'redshift/' + directory + '/');

    return this.redshiftqueryutilities.instantiateRedshift().then(() => {

      let query_promises = arrayutilities.map(table_filenames, (filename) => {
        return this.collectQueryFromPath(path_to_model, filename, versioned)
      });


      return this.redshiftqueryutilities.openConnection().then(() => {

        return Promise.all(query_promises).then((query_responses) => {
          this.redshiftqueryutilities.closeConnection();
          return query_responses;
        });
      });

    });
  }

  generateQueries(table_filenames,command) {

    du.highlight('Table Queries');

    return arrayutilities.map(table_filenames, table_name => command+' TABLE ' + table_name.replace('.sql', '') + ';');

  }

  collectQueryFromPath(directory, filename, versioned) {

    du.debug('Collect Query From Path');

    if (_.isUndefined(versioned)) {
      versioned = true;
    }

    let path = directory + filename;
    let file_contents = fileutilities.getFileContentsSync(path);
    let query = file_contents;

    if (!versioned) {
      return Promise.resolve(query);
    }

    return this.determineTableVersions(filename, path).then((versions) => {

      let version_in_database = versions[0];
      let local_version = versions[1];

      du.debug(
        'Filename: ' + filename,
        'Database Version Number: ' + version_in_database,
        'File Version Number ' + local_version);

      if (version_in_database < local_version) {

        return Promise.resolve(query);

      }

      return Promise.resolve('');

    });

  }

  determineTableVersions(filename, path) {
    return Promise.all([
      this.getRemoteTableVersion(filename),
      this.getVersionNumberFromFile(path)
    ]);
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

  getRemoteTableVersion(filename) {

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

      du.debug('Got response table_name ', table_name);
      if (result && result.length > 0) {
        return result[0].version;
      }
      return 0;
    });

  }

  deleteClusterAndWait() {

    let parameters_wait = this.createParametersObject('wait');
    let parameters_delete = this.createParametersObject('destroy');

    return this.redshiftutilities.deleteCluster(parameters_delete).then(() => {
      return this.redshiftutilities.waitForCluster('clusterDeleted', parameters_wait);
    });

  }

  createClusterAndWait() {

    let parameters_wait = this.createParametersObject('wait');
    let parameters_create = this.createParametersObject('create');

    du.debug('Create cluster ' + parameters_create);

    return this.redshiftutilities.createCluster(parameters_create).then(() => {
      return this.redshiftutilities.waitForCluster('clusterAvailable').then((data) => {
        /*return this.redshiftutilities.writeHostConfiguration(data,parameters_wait).then(() => {
          return data;
        });*/
      })
    });

  }

  destroyCluster() {

    let parameters = this.createParametersObject('describe');

    return this.redshiftutilities.clusterExists(parameters).then(exists => {

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

    let parameters = this.createParametersObject('describe');

    return this.redshiftutilities.clusterExists(parameters).then(exists => {

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

  createParametersObject(group_name) {

    let response_object = {};

    let configuration_groups = {
      'describe': ['ClusterIdentifier'],
      'wait': ['ClusterIdentifier'],
      'create': ['ClusterIdentifier', 'NodeType', 'MasterUsername', 'MasterUserPassword', 'ClusterType', 'DBName', 'AutomatedSnapshotRetentionPeriod', 'PubliclyAccessible', 'Port'],
      'destroy': ['ClusterIdentifier', 'FinalClusterSnapshotIdentifier', 'SkipFinalClusterSnapshot']
    };

    let translation_object = {
      ClusterIdentifier: ['cluster_identifier'],
      NodeType: ['node_type'],
      MasterUsername: ['user'],
      DBName: ['database'],
      MasterUserPassword: ['password'],
      ClusterType: ['cluster_type'],
      AutomatedSnapshotRetentionPeriod: ['automated_snapshot_retention_period'],
      PubliclyAccessible: ['publicly_accessible'],
      SkipFinalClusterSnapshot: ['skip_final_cluster_snapshot'],
      FinalClusterSnapshotIdentifier: ['final_cluster_snapshot_identifier'],
      Port: ['port']
    };

    configuration_groups[group_name].forEach((key) => {

      //This shouldn't be here...
      let discovered_data = objectutilities.recurseByDepth(this.configFile, function(p_key) {

        return (_.contains(translation_object[key], p_key));

      });

      response_object[key] = discovered_data;

    });

    return response_object;

  }

}

module.exports = new RedshiftDeployment();
