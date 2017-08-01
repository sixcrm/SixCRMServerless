'use strict';
require('../../SixCRM.js');

const fs = require('fs');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

let redshiftqueryutilities = global.SixCRM.routes.include('lib', 'redshift-query-utilities.js');

du.highlight('Seeding Redshift tables with static data');

let queries = [];

setupEnvironmentVariables()
    .then(() => getSeedNames())
    .then((names) => collectQueries(names))
    .then(() => execute())
    .then(() => {du.highlight('Complete')});

function setupEnvironmentVariables() {

    process.env.search_indexing_queue = 'search_indexing';
    process.env.dynamo_endpoint = global.SixCRM.configuration.site_config.dynamodb.endpoint;
    process.env.redshift_user = global.SixCRM.configuration.site_config.redshift.user;
    process.env.redshift_password = global.SixCRM.configuration.site_config.redshift.password;
    process.env.redshift_database = global.SixCRM.configuration.site_config.redshift.database;
    process.env.redshift_port = global.SixCRM.configuration.site_config.redshift.port;
    process.env.redshift_pool_max = global.SixCRM.configuration.site_config.redshift.user;
    process.env.redshift_idle_timeout = global.SixCRM.configuration.site_config.redshift.idleTimeoutMillis;

    return global.SixCRM.configuration.getEnvironmentConfig('redshift.host').then((value) => { process.env.redshift_host = value });

}

function collectQueryFromPath(path, env) {
    du.highlight('Reading ' + path);

    let content = fs.readFileSync(path, 'utf-8');

    queries.push(content);
}

function collectQueries(files, env) {

    let directory = global.SixCRM.routes.path('model', 'redshift/seeds');

    files.forEach((file) => {
        collectQueryFromPath(`${directory}/${file}`);
    });
}

function execute() {

    if (queries.length < 1) {
        return Promise.resolve();
    }

    return redshiftqueryutilities.instantiateRedshift().then(() => {

        return redshiftqueryutilities.openConnection().then(() => {

            return Promise.all(queries.map((query) => redshiftqueryutilities.queryRaw(query)));

        }).then(() => {

            return redshiftqueryutilities.closeConnection();

        });
    });
}

function getSeedNames(){

    du.debug('Get Redshift Seed Names');

    let directory = global.SixCRM.routes.path('model', 'redshift/seeds');
    let files = fs.readdirSync(directory).filter(file => file.match(/\.sql$/));

    return Promise.resolve(files);
}

function getConfig() {
    let config = global.SixCRM.routes.include('config', `${process.env.stage}/site.yml`);

    if (!config) {
        throw 'Unable to find config file.';
    }
    return config;
}
