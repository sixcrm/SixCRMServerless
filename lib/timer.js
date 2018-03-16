'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp');

class Timer {

    constructor(){

    }

    set(){

        this.start = timestamp.createTimestampMilliseconds();

    }

    get(force){

        if(!_.has(this, 'start')){

          eu.throwError('server','You must set the timer with "set" before calling "get".');

        }

        let now = timestamp.createTimestampMilliseconds();

        let elapsed = (now - this.start);

        if(force){

            let verbose_setting = process.env.SIX_VERBOSE;

            process.env.SIX_VERBOSE=2;
            du.info('Execution Time: '+elapsed+' ms');
            process.env.SIX_VERBOSE=verbose_setting;

        }else{

            du.info('Execution Time: '+elapsed+' ms');

        }


        return elapsed;

    }


}

module.exports = new Timer();
