'use strict';
const _ = require('underscore');
const fs = require('fs');

var timestamp = require('../../lib/timestamp.js');

const du = require('../../lib/debug-utilities.js');
const redshiftutilities = require('../../lib/redshift-utilities.js');

class AnalyticsController {

    getTransactionSummary(parameters){

      du.debug('Get Transaction Summary');

      return this.getQueryString('transaction_summary').then((query) => {

        du.debug('Raw parameters:', parameters);

        parameters = ['df6a75c8-67d1-5ec2-8d54-94ae46d817b3', 'date\'3.1.2017\'', 'date\'3.31.2017\''];

        du.highlight('Query:', query, 'Parameters:', parameters);

        return redshiftutilities.query(query, parameters).then((results) => {

          return Promise.resolve({
            transactions:[
              {
                datetime: "2017-04-20T20:57:32.802Z",
                byprocessorresult: [
                  {
                    processor_result: "success",
                    count: 14,
                    amount: 450.99
                  },
                  {
                    processor_result: "decline",
                    count: 2,
                    amount: 32.98
                  },
                  {
                    processor_result: "error",
                    count: 2,
                    amount: 32.98
                  }
                ]
              },
              {
                datetime: "2017-04-21T17:41:41.117Z",
                byprocessorresult: [
                  {
                    processor_result: "success",
                    count: 14,
                    amount: 450.99
                  },
                  {
                    processor_result: "decline",
                    count: 2,
                    amount: 32.98
                  },
                  {
                    processor_result: "error",
                    count: 2,
                    amount: 32.98
                  }
                ]
              }
            ]
          });

        });

      });

    }

    getQueryString(query_name){

      du.debug('Get Query String');

      return new Promise((resolve, reject) => {

        let query_filepath = this.getQueryFilepath(query_name);

        du.debug('Filepath: ', query_filepath);

        fs.readFile(query_filepath, 'utf8', (error, data) => {

          if(error) { return reject(error); }

          return resolve(data);

        });

      });


    }

    getQueryFilepath(query_name){

      du.debug('Get Query Filepath');

      return __dirname+'/queries/'+query_name+'.sql';

    }

}

module.exports = new AnalyticsController();
