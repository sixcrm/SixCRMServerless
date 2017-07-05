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

function collectQueryFromPath(path, file) {
    du.highlight('Constructing Query '+file);

    return Promise.all([
        getTableVersion(file),
        extractVersionNumber(path)
    ]).then((results) => {

        let versionInDb = results[0];
        let versionInFile = results[1];

        if (versionInDb < versionInFile && !file.match(/^\d/)) {
            du.highlight(' T '+file+' '+versionInDb+versionInFile);
            let content = fs.readFileSync(path, 'utf-8');

            query += `${content};`;

        }

    });

}

function collectQueries(files) {

    let directory = global.routes.path('model', 'redshift');

    files.forEach((file) => {
        collectQueryFromPath(`${directory}/${file}`,file);
    });
}

function extractVersionNumber(path) {

    du.highlight('Reading Version Number');

    return Number(fs.readFileSync(path,'utf-8').split('\n').filter( line => line.match(/TABLE_VERSION/)).toString().replace(/[^0-9]/g,''));

}

function execute() {
    redshiftutilities.query(query);
}

function getTableNames(){

    du.highlight('Get Redshift Table Names');

    let directory = global.routes.path('model', 'redshift');
    let files = fs.readdirSync(directory).filter(file => file.match(/\.sql$/));

    files.sort();
    return Promise.resolve(files);
}

function getTableVersion(name) {

    du.highlight('Get Redshift Table Version');

    //let query = 'select version from sys_sixcrm.sys_table_version where table_name =\''+name.replace('.sql', '')+'\'';
    let query = 'select 1';

    return redshiftutilities.query(query).catch((e) => {  console.log(e) });
}

function getConfig() {
    let config = global.routes.include('config', `${process.env.stage}/site.yml`);

    if (!config) {
        throw 'Unable to find config file.';
    }
    return config;
}
