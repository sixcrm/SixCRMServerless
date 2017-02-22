'use strict'
var _ =  require('underscore');

class Timestamp {
	
	static createTimestampSeconds(){
		return Math.floor(Date.now() / 1000);
	}
	
	static createTimestampMilliseconds(){
		return Date.now();
	}
	
	static createDate(){
		var date = new Date(this.createTimestampMilliseconds());
		return date.toUTCString();
	}
	
	static secondsToDate(timestamp){
		var date = new Date(timestamp*1000);
		return date.toUTCString();
	}
	
	static getTimeDifference(timestamp){
		var now = this.createTimestampSeconds();
		return now - timestamp;
	}
}

module.exports = Timestamp;