'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';
let redshiftutilities;

du.highlight('Deploying Redshift Tables');

let query = '';

setupEnvironmentVariables()
    .then(() => getTableNames())
    .then((names) => collectQueries(names))
    .then(() => execute())
    .then(() => {du.highlight('Complete')});

function setupEnvironmentVariables() {
    process.env.stage = environment;
    process.env.search_indexing_queue_url = getConfig().sqs.search_indexing_queue_url;

    process.env.dynamo_endpoint = getConfig().dynamodb.endpoint;

    process.env.redshift_user = getConfig().redshift.user;
    process.env.redshift_password = getConfig().redshift.password;
    process.env.redshift_host = getConfig().redshift.host;
    process.env.redshift_database = getConfig().redshift.database;
    process.env.redshift_port = getConfig().redshift.port;
    process.env.redshift_pool_max = getConfig().redshift.user;
    process.env.redshift_idle_timeout = getConfig().redshift.idleTimeoutMillis;

    redshiftutilities = global.routes.include('lib', 'redshift-utilities.js');

    return Promise.resolve();
}

function collectQueryFromPath(path, file, env) {

  return Promise.all([
        getTableVersion(file),
        extractVersionNumber(path)
    ]).then(([result1, result2]) => {

        let versionInDb = result1;
        let versionInFile = result2;

        console.log(versionInDb+' '+' '+versionInFile+' '+file)
        if (versionInDb < versionInFile || file.match(/^\d/)) {

            let content = fs.readFileSync(path, 'utf-8');

            query += `${content};`;

        }

    }).catch(e => {
        du.error(e);
  });

}

function collectQueries(files, env) {

    let directory = global.routes.path('model', 'redshift');

    redshiftutilities.instantiateRedshift();

    return redshiftutilities.openConnection().then(() => {
        return Promise.all(files.map((file) => collectQueryFromPath(`${directory}/${file}`,file)));
    }).then(() => {
        return redshiftutilities.closeConnection();
    });

}

function extractVersionNumber(path) {

    du.highlight('Reading Version Number');

    return Number(fs.readFileSync(path,'utf-8').split('\n').filter( line => line.match(/TABLE_VERSION/)).toString().replace(/[^0-9]/g,''));

}

function execute() {
    console.log(process.env.AWS_ACCESS_KEY_ID +' ' +process.env.AWS_SECRET_ACCESS_KEY)
    redshiftutilities.query(query);
}



function getTableNames(){

    du.highlight('Get Redshift Table Names');

    let directory = global.routes.path('model', 'redshift');
    let files = fs.readdirSync(directory).filter(file => file.match(/\.sql$/));

    files.sort();
    return Promise.resolve(files);
}

function getTableVersion(name, env) {

    du.highlight('Get Redshift Table Version');

    let version_query = 'select version from sys_sixcrm.sys_table_version where table_name =\''+name.replace('.sql', '')+'\'';

    return redshiftutilities.queryRaw(version_query).then(result => {

        if (result && result.length > 0) {
            return result[0].version;
        }

        return 0;
    });
}

function getConfig() {
    let config = global.routes.include('config', `${process.env.stage}/site.yml`);

    if (!config) {
        throw 'Unable to find config file.';
    }
    return config;
}
