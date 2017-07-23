'use strict';
require('../../SixCRM.js');

const fs = require('fs');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

let redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

du.highlight('Destroying Redshift Tables');

let query = '';

setupEnvironmentVariables()
    .then(() => getTableNames())
    .then((names) => collectFileNames(names))
    .then(() => executeDestroy())
    .then(() => {du.highlight('Complete')});

function setupEnvironmentVariables() {

    process.env.search_indexing_queue = 'search_indexing';
    process.env.dynamo_endpoint = global.SixCRM.configuration.site_config.dynamodb.endpoint;
    process.env.redshift_user = global.SixCRM.configuration.site_config.redshift.user;
    process.env.redshift_password = global.SixCRM.configuration.site_config.redshift.password;
    process.env.redshift_host = global.SixCRM.configuration.site_config.redshift.host;
    process.env.redshift_database = global.SixCRM.configuration.site_config.redshift.database;
    process.env.redshift_port = global.SixCRM.configuration.site_config.redshift.port;
    process.env.redshift_pool_max = global.SixCRM.configuration.site_config.redshift.user;
    process.env.redshift_idle_timeout = global.SixCRM.configuration.site_config.redshift.idleTimeoutMillis;

    return Promise.resolve();

}

function collectFileName(file_name, env) {
    du.highlight(file_name);

    let table_name = file_name.replace('.sql', '').replace(/[0-9]_/,'');

    query += `DROP TABLE IF EXISTS ${table_name};`;
}

function collectFileNames(tables, env) {
    tables.forEach((table) => {
        collectFileName(table);
    });
}

function executeDestroy() {
    du.warning(query);

    redshiftqueryutilities.query(query);
}

function getTableNames() {

    du.debug('Get Redshift Table Names');

    let directory = global.SixCRM.routes.path('model', 'redshift');
    let files = fs.readdirSync(directory).filter(file => file.match(/\.sql$/));

    return Promise.resolve(files);
}
