var pg = require('pg');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'admin',
  database: 'dev',
  password:'Jagodica9',
  port: 5439,
  host: 'sixcrm-test.ch9ptr45aofu.us-east-1.redshift.amazonaws.com',
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var redshiftClient = new pg.Pool(config);

module.exports = redshiftClient;
