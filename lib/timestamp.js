'use strict';

const oneDayInSeconds = 86400;

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

	/**
     * Returns the difference in days from now to given time.
     * @param timeInSeconds Given time in seconds.
     * @returns {number} Number of days, can be negative.
     */
    static getDaysDifference(timeInSeconds){
        let time_difference = this.getTimeDifference(timeInSeconds);
        return  Math.floor((time_difference / oneDayInSeconds));
    }

}

module.exports = Timestamp;