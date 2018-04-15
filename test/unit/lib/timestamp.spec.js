

const chai = require('chai');
const expect = chai.expect;
const moment = require('moment');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const frozenNow = 1487768599196;  // '2017-02-22T13:03:19.196Z';
const frozenNowAsISO8601 = '2017-02-22T13:03:19.196Z';
const frozenNowAsISOString = 'Wed, 22 Feb 2017 13:03:19 GMT';
const frozenNowInSeconds = 1487768599;
const oneDayInMiliseconds = 86400000;

describe('lib/timestamp', () => {

	describe('toISO8601', () => {

		it('returns matching strings', () => {

			let now = timestamp.getISO8601();

			expect(now).to.equal(moment(now).toISOString());

		});

	});

	describe('startOfDay', () => {

		it('returns the start of the day', () => {

			expect(timestamp.startOfDay(frozenNowAsISO8601)).to.equal('2017-02-22T00:00:00.000Z');

		});

	});

	describe('endOfDay', () => {

		it('returns the start of the day', () => {

			expect(timestamp.endOfDay(frozenNowAsISO8601)).to.equal('2017-02-22T23:59:59.999Z');

		});

	});

	describe('isToday', () => {

		xit('returns true', () => {

			let today = timestamp.getISO8601();

			expect(timestamp.isToday(today)).to.equal(true);

		});

		it('returns false', () => {

			let yesterday  = timestamp.yesterday();

			expect(timestamp.isToday(yesterday, 10)).to.equal(false);

		});

	});

	describe('timestamp', () => {

		it('should create timestamp in seconds', () => {
			// given
			givenTimeIsFrozen();

			// when
			let timestampInSeconds = timestamp.createTimestampSeconds();

			// then
			expect(timestampInSeconds).to.equal(frozenNowInSeconds);
		});

		it('should create timestamp in milliseconds', () => {

			// when
			const timestampInMilliseconds = timestamp.createTimestampMilliseconds();

			// then
			const now = moment().valueOf();
			expect(now).to.be.greaterThan(timestampInMilliseconds);
			expect(now).to.be.lessThan(timestampInMilliseconds + 1000);
		});

		it('should create a date', () => {
			// given
			givenTimeIsFrozen();

			// when
			let createdDate = timestamp.createDate();

			// then
			expect(createdDate).to.equal(frozenNowAsISOString);
		});

		it('calculates date from seconds', () => {
			// given
			givenTimeIsFrozen();

			// when
			let dateFromSeconds = timestamp.secondsToDate(frozenNowInSeconds);

			// then
			expect(dateFromSeconds).to.equal(frozenNowAsISOString);
		});

		it('calculates difference in seconds between now and given time', () => {
			// given
			givenTimeIsFrozen();
			let expectedDifferenceInSeconds = 10;

			// when
			let differenceInSeconds = timestamp.getTimeDifference(frozenNowInSeconds - expectedDifferenceInSeconds);

			// then
			expect(differenceInSeconds).to.equal(expectedDifferenceInSeconds);
		});

		it('retrieves date rounded by this hour', () => {
			// given
			givenTimeIsFrozen();

			// when
			let this_hour = timestamp.getThisHourInISO8601();

			// then
			expect(this_hour).to.equal('2017-02-22T13:00:00.000Z');
		});


		it('retrieves date rounded by last hour', () => {
			// given
			givenTimeIsFrozen();

			// when
			let last_hour = timestamp.getLastHourInISO8601();

			// then
			expect(last_hour).to.equal('2017-02-22T12:00:00.000Z');
		});

		it('successfully retrieves format from moment', () => {

			let frozenDate = new Date(frozenNowAsISO8601);

			let yearFromFrozenDate = frozenDate.getFullYear();

			expect(timestamp.getFormat('YYYY')).to.equal(yearFromFrozenDate.toString());
		});

		it('returns false when appointed value is not according to ISO8601', () => {
			let invalidDate = 'a12bc3';

			expect(timestamp.isISO8601(invalidDate)).to.be.false;
		});

		it('returns date converted to ISO8601', () => {
			// given
			givenTimeIsFrozen();

			expect(timestamp.convertToISO8601(frozenNow)).to.equal(frozenNowAsISO8601);
		});

		it('returns date as ISO8601', () => {

			expect(timestamp.castToISO8601(frozenNowAsISO8601)).to.equal(frozenNowAsISO8601);
		});

		it('returns date converted to ISO8601 from appointed string', () => {

			let convertedDate = '2017-02-22T13:03:19.000Z';

			expect(timestamp.castToISO8601(frozenNowAsISOString)).to.equal(convertedDate);
		});

		it('returns validation error when date type is invalid', () => {

			let invalidDate = -1;

			try {
				timestamp.castToISO8601(invalidDate);
			}catch(error){
				expect(error.message).to.equal('[500] Unrecognized date type: ' + invalidDate);
			}
		});

		it('returns error when specified time is not an natural integer', () => {

			try {
				timestamp.delay(-1);
			}catch(error){
				expect(error.message).to.equal('[500] Timestamp.delay assumes time is an natural integer.');
			}

		});

		it('should calculate difference between two dates in milliseconds', () => {

			let start = frozenNow + 1; //increase by any number

			let end = frozenNow;

			expect(timestamp.differenceInMiliseconds(start, end)).to.equal(1);
		});

		it('should calculate difference between two ISO8601 dates in milliseconds', () => {

			let start = '2017-02-22T14:03:19.196Z'; //any date in ISO8601 format

			let end = frozenNowAsISO8601;

			expect(timestamp.differenceInMiliseconds(start, end)).to.equal(3600000);
		});

		function givenTimeIsFrozen() {
			Date.now = () => {
				return frozenNow;
			}
		}
	});

	describe('should calculate day difference', () => {
		it('for today', () => {
			expect(timestamp.getDaysDifference(nowInMilliseconds())).to.equal(0);
		});

		it('for tomorrow', () => {
			expect(timestamp.getDaysDifference(nowInMilliseconds() + oneDayInMiliseconds)).to.equal(-1);
		});

		it('for yesterday', () => {
			expect(timestamp.getDaysDifference(nowInMilliseconds() - oneDayInMiliseconds)).to.equal(1);
		});

		function nowInMilliseconds() {
			return timestamp.createTimestampMilliseconds();
		}
	});

	describe('should calculate seconds difference', () => {
		it('for now', () => {
			expect(timestamp.getSecondsDifference(nowInMilliseconds())).to.equal(0);
		});

		it('for 5 seconds', () => {
			expect(timestamp.getSecondsDifference(nowInMilliseconds() - 5000)).to.equal(5);
		});

		it('for minus 5 seconds', () => {
			expect(timestamp.getSecondsDifference(nowInMilliseconds() + 5000)).to.equal(5);
		});

		it('for one minute', () => {
			expect(timestamp.getSecondsDifference(nowInMilliseconds() + 60000)).to.equal(60);
		});

		function nowInMilliseconds() {
			return timestamp.createTimestampMilliseconds();
		}
	});
});
