'use strict'
var _ =  require('underscore');

class Timestamp {
	
	static createTimestampSeconds(){
		return Math.floor(Date.now() / 1000);
	}
	
	static createTimestampMicroSeconds(){
		return Date.now();
	}
	
	static createDate(){
		var date = new Date(this.createTimestampMicroSeconds());
		return date.toUTCString();
	}
	
	static secondsToDate(timestamp){	
		var date = new Date(timestamp*1000);
		return date.toUTCString();
	}
	
}

module.exports = Timestamp;