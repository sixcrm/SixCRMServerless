'use strict'

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

setEnvironmentVariables();

const dataGenerator = global.SixCRM.routes.include('controllers','workers/randomRedshiftDataGenerator');

dataGenerator.set('start_datetime', '2017-05-18T18:00:44.500Z');
dataGenerator.set('end_datetime', '2017-05-18T18:30:44.500Z');

return dataGenerator.execute().then(() => {

    du.highlight('Process Complete');

    return true;
}).catch((error) => {
    throw error;
});

function setEnvironmentVariables(){

    //Technical Debt:  This should be using the Serverless Utilities class
    process.env.SIX_VERBOSE = 2;
    process.env.stage = 'local';
    process.env.dynamo_endpoint = 'localhost';
    process.env.redshift_user = 'admin';
    process.env.redshift_password = 'Jagodica9';
    process.env.redshift_database = 'analytics';
    process.env.redshift_port = 5439;
    process.env.redshift_pool_max = 10;
    process.env.redshift_idle_timeout = 30000;
    process.env.redshift_random_data_interval = 300;

    //Technical Debt: Nope.
    process.env.redshift_host = 'sixcrm-test.ch9ptr45aofu.us-east-1.redshift.amazonaws.com';

}
