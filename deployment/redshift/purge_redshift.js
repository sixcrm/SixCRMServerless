'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');

let environment = process.argv[2] || 'development';
let redshiftutilities;

du.highlight('Purging Redshift Tables');

let truncate_query = '';

setupEnvironmentVariables()
    .then(() => getTableNames())
    .then((names) => collectFileNames(names))
    .then(() => executePurge())
    .then(() => {du.highlight('Complete')});

function setupEnvironmentVariables() {
    process.env.stage = environment;
    process.env.search_indexing_queue = 'search_indexing';

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

function collectFileName(file_name, env) {
    du.highlight(file_name);

    let table_name = file_name.replace('.sql', '');

    truncate_query += `TRUNCATE TABLE ${table_name};`;
}

function collectFileNames(tables, env) {
    tables.forEach((table) => {
        collectFileName(table);
    });
}

function executePurge() {
    du.warning(truncate_query);

    redshiftutilities.query(truncate_query);
}

function getTableNames() {

    du.debug('Get Redshift Table Names');

    let directory = global.routes.path('model', 'redshift');
    let files = fs.readdirSync(directory).filter(file => file.match(/\.sql$/));

    return Promise.resolve(files);
}

function getConfig() {
    let config = global.routes.include('config', `${process.env.stage}/site.yml`);

    if (!config) {
        throw 'Unable to find config file.';
    }
    return config;
}
