'use strict';

class Timestamp {
	
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
}

module.exports = Timestamp;