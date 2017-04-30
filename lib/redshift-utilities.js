'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const pg = require('pg');

const du = require('./debug-utilities.js');
const timestamp = require('./timestamp');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

class RedshiftUtilities {

    constructor(stage){

        this.required_configuration = [
            'redshift_user',
            'redshift_database',
            'redshift_host',
            'redshift_port',
            'redshift_pool_max',
            'redshift_idle_timeout'
        ];

    }

    instantiateRedshift(){

        let errors = [];

        this.required_configuration.forEach((configuration_parameter) => {

            if(!_.has(process.env, configuration_parameter)){

                errors.push('Missing Redshift configuration parameter: '+configuration_parameter);

            }

        });

        if(errors.length > 0){

            throw new Error('Redshift connection errors: '+errors.join(', '));

        }else{

            let pg_config = {
                user: process.env.redshift_user,
                database: process.env.redshift_database,
                password: process.env.redshift_password,
                host: process.env.redshift_host,
                port: process.env.redshift_port,
                max: process.env.redshift_pool_max,
                idleTimeoutMillis: process.env.redshift_idle_timeout
            };

            this.redshift = new pg.Client(pg_config);

        }

    }

    query(query, parameters){

        du.debug('Query Redshift');

        return new Promise((resolve, reject) => {

            this.instantiateRedshift();

            this.openConnection().then(() => {

                this.redshift.query(query, parameters, (error, result) => {

                    this.closeConnection().then(() => {

                        if (error){ return reject(error); }

                        return resolve(result.rows);

                    });

                });

            });

        });

    }

    openConnection(){

        du.debug('Open Connection');

        return new Promise((resolve, reject) => {

            this.redshift.connect((error) => {

                if (error){ return reject(error); }

                return resolve(true);

            });

        });

    }

    closeConnection(){

        du.debug('Close Connection');

        return new Promise((resolve, reject) => {

            this.redshift.end((error) => {

                if (error){ return reject(error); }

            });

            return resolve(true);

        });

    }

}

module.exports = new RedshiftUtilities(process.env.stage);
