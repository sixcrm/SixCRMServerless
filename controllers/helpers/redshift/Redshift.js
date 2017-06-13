'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = class redshiftHelperController {

    constructor(){

        this.kinesisfirehoseutilities = global.routes.include('lib', 'kinesis-firehose-utilities.js');

    }

    pushRecordToRedshift(table, object){

        du.debug('Push Record To Redshift');

        return this.kinesisfirehoseutilities.putRecord(table, object).then((result) => {

            du.output('Kinesis Firehose Result', result);

            return result;

        });

    }

    pushActivityToRedshift(activity){

        du.debug('Push Activity to Redshift');

        return this.pushRecordToRedshift('activity', activity).then(() => {

            return activity;

        });

    }

    pushEventToRedshift(object){

        du.debug('Push Event to Redshift');

        return this.pushRecordToRedshift('events', object).then(() => {

            return object;

        });

    }

    pushTransactionsToRedshift(object){

        du.debug('Push Transactions to Redshift');

        return this.pushRecordToRedshift('transactions', object).then(() => {

            return object;

        });

    }

}
