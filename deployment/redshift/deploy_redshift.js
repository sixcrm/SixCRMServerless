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

function collectQueryFromPath(path, env) {
    du.highlight('Reading ' + path);

    let content = fs.readFileSync(path, 'utf-8');

    query += `${content};`;
}

//

function collectQueries(files, env) {

    let directory = global.routes.path('model', 'redshift');

    files.forEach((file) => {
        collectQueryFromPath(`${directory}/${file}`);
    });
}

function extractVersionNumber(path, env) {

    du.highlight('Reading Version Number' + path);

    let version_number = Number(fs.readFileSync(path,'utf-8').split('\n').filter( line => line.match(/TABLE_VERSION/)).toString().replace(/[^0-9]/g,''));

    return Promise.resolve(version_number);
}

function execute() {
    redshiftutilities.query(query);
}

function getTableNames(){

    du.debug('Get Redshift Table Names');

    let directory = global.routes.path('model', 'redshift');
    let files = fs.readdirSync(directory).filter(file => file.match(/\.sql$/));

    files.sort();
    return Promise.resolve(files);
}

function getTableVersion(name) {

    du.debug('Get Redshift Table Version');
    du.debug(name);
    let query = 'select version from sys_sixcrm.sys_table_version where table_name =\''+name +'\';';
    let version = redshiftutilities.query(query);

    du.debug(version);
    return Promise.resolve(version);
}

function getConfig() {
    let config = global.routes.include('config', `${process.env.stage}/site.yml`);

    if (!config) {
        throw 'Unable to find config file.';
    }
    return config;
}
