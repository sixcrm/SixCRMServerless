'use strict';
const _ = require('underscore');
const oneDayInSeconds = 86400;
const moment = require('moment');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

class Timestamp {

    static delay(time, passthrough){

      if(!mathutilities.isInteger(time)){
        eu.throwError('server', 'Timestamp.delay assumes time is an integer.')
      }

      if(time < 0){
        eu.throwError('server', 'Timestamp.delay assumes time is a positive natural number.');
      }

      return (passthrough) => {
        return new Promise((resolve) => {
          return setTimeout(
            () => { return resolve(passthrough); },
            time
          );
        });
      }

    }

    static createTimestampSeconds(){
        return Math.floor(Date.now() / 1000);
    }

    static createTimestampMilliseconds(){
        return Date.now();
    }

    static createDate(){
        let date = new Date(this.createTimestampMilliseconds());

        return date.toUTCString();
    }

    static secondsToDate(timestampInSeconds){
        let date = new Date(timestampInSeconds*1000);

        return date.toUTCString();
    }

    static getTimeDifference(timestampInSeconds){
        let now = this.createTimestampSeconds();

        return now - timestampInSeconds;
    }

    static toISO8601(timeInSeconds){
    	var date = new Date(timeInSeconds*1000);

        return this.castToISO8601(date);

    }

    static getISO8601(){

    	var date = new Date();

        return this.castToISO8601(date);

    }

    static castToISO8601(date_object){

        if((date_object instanceof Date)){

            return date_object.toISOString();

        }else if(_.isString(date_object)){

            if(this.isISO8601(date_object)){

                return date_object;

            }else{

                return this.convertToISO8601(date_object);

            }

        }

        eu.throwError('validation','Unrecognized date type: '+date_object);

    }

    static convertToISO8601(date){

        date = new Date(date);
        return this.castToISO8601(date);
    }

    static isISO8601(string){

        let re = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/

        if(re.test(string)) { return true; }

        return false;

    }

    static getFormat(format){
        return moment().format(format);
    }

    static convertToFormat(date, format){
        let this_date = new Date(date);

        return moment(this_date).format(format);
    }
	/**
     * Returns the difference in days from now to given time.
     * @param timeInSeconds Given time in seconds.
     * @returns {number} Number of days, can be negative.
     */
    static getDaysDifference(timeInSeconds){
        let time_difference = this.getTimeDifference(timeInSeconds);

        return  Math.floor((time_difference / oneDayInSeconds));
    }

    static dateToTimestamp(a_date){
    	let date = new Date(a_date);

    	return Math.floor((date.getTime()/1000));
    }

}

module.exports = Timestamp;
