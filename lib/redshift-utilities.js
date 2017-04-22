'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const pg = require('pg');

const du = require('./debug-utilities.js');
const timestamp = require('./timestamp');

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

        this.instantiateRedshift();

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

            return this.redshift.connect((error) => {

                if (error){ return reject(error); }

                this.redshift.query(query, parameters, (error, result) => {

                    this.redshift.end((error) => {

                        if (error){ return reject(error); }

                    });

                    if (error){ return reject(error); }

            //du.debug(result.rows);

                    return resolve(result.rows);

                });

            });

        });
    }

}

module.exports = new RedshiftUtilities(process.env.stage);
