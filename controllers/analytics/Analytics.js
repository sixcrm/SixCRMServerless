'use strict';
const _ = require('underscore');

var timestamp = require('../../lib/timestamp.js');

const du = require('../../lib/debug-utilities.js');
//const redshift = require('../../lib/redshift-utilities.js');

class AnalyticsController {

    constructor(){

    }

    getTransactionSummary(){

      du.debug('Get Transaction Summary');

      return Promise.resolve({
        transaction_summary:[
          {
            datetime: "2017-04-20T20:57:32.802Z",
            byprocessoresult:[
              {
                processor_result: "success",
                count: 14
                amount:450.99
              },
              {
                processor_result: "decline",
                count: 2
                amount: 32.98
              },
              {
                processor_result: "error",
                count: 2
                amount: 32.98
              }
            ]
          },
        ]
      });

    }

}

module.exports = new AnalyticsController();
