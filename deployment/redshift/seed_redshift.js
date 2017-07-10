'use strict';
require('../../routes.js');

const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');

let environment = process.argv[2] || 'development';
let region = process.argv[3] || process.env.AWS_REGION || 'us-east-1';
let redshiftutilities;

du.highlight('Seeding Redshift tables with static data');

let queries = [];

setupEnvironmentVariables()
    .then(() => getSeedNames())
    .then((names) => collectQueries(names))
    .then(() => execute())
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

function collectQueryFromPath(path, env) {
    du.highlight('Reading ' + path);

    let content = fs.readFileSync(path, 'utf-8');

    queries.push(content);
}

function collectQueries(files, env) {

    let directory = global.routes.path('model', 'redshift/seeds');

    files.forEach((file) => {
        collectQueryFromPath(`${directory}/${file}`);
    });
}

function execute() {

    if (queries.length < 1) {
        return Promise.resolve();
    }

    redshiftutilities.instantiateRedshift();

    return redshiftutilities.openConnection().then(() => {
        return Promise.all(queries.map((query) => redshiftutilities.queryRaw(query)));
        // return Promise.all(queries.map((query) => du.highlight(query)));
    }).then(() => {
        return redshiftutilities.closeConnection();
    });

}

function getSeedNames(){

    du.debug('Get Redshift Seed Names');

    let directory = global.routes.path('model', 'redshift/seeds');
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
