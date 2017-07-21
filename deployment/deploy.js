'use strict';
require('../routes.js');
const fs = require('fs');

const du = global.routes.include('lib', 'debug-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');

let environment = configurationutilities.resolveStage(process.argv[2]);

du.highlight('Deploying environment \'' + environment + '\'.');

getJobGroups().forEach((group) => {
    du.highlight('Executing group \'' + group + '\'.');

    let job_promises = [];

    getJobs(group).forEach((job_file_name) => {
        let jobModule = global.routes.include('deployment', 'jobs/' + group + '/' + job_file_name);
        let job = new jobModule();

        job_promises.push(job.execute(environment));
    });

    // Execute synchronously.
    job_promises.reduce((p, fn) => p.then(fn), Promise.resolve())

});
du.highlight('Finished');

function getJobGroups() {
    let base_directory = global.routes.path('deployment', 'jobs');

    return fs.readdirSync(base_directory)
        .filter((file) => fs.statSync(base_directory + '/' + file).isDirectory());
}

function getJobs(group) {
    let base_directory = global.routes.path('deployment', 'jobs/' + group);

    return fs.readdirSync(base_directory)
        .filter((file) => fs.statSync(base_directory + '/' + file).isFile());
}