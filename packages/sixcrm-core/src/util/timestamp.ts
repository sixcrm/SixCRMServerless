import * as _ from 'lodash';
import * as moment from 'moment';
import eu from './error-utilities';
import numberutilities from './number-utilities';

const oneDayInSeconds = 86400;

// Technical Debt:  Need to consider that toISOString() returns a timestamp in UTC...
// Technical Debt:  This could use a refactor.  Test cases too...
export default class Timestamp {

	static daysDifference(timestamp_1: moment.Moment, timestamp_2: moment.Moment | null = null) {

		if (timestamp_2 === null) {
			timestamp_2 = moment.utc().startOf('day');
		} else {
			timestamp_2 = moment.utc(timestamp_2).startOf('day');
		}

		timestamp_1 = moment.utc(timestamp_1).startOf('day');

		return timestamp_1.diff(timestamp_2, 'days');

	}

	static startOfMonth(timestamp) {

		timestamp = (_.isUndefined(timestamp) || _.isNull(timestamp)) ? this.getISO8601() : timestamp;

		return moment.utc(timestamp).startOf('month').toISOString();

	}

	static startOfWeek(timestamp) {

		timestamp = (_.isUndefined(timestamp) || _.isNull(timestamp)) ? this.getISO8601() : timestamp;

		return moment.utc(timestamp).startOf('day').toISOString();

	}

	static startOfDay(timestamp) {

		timestamp = (_.isUndefined(timestamp) || _.isNull(timestamp)) ? this.getISO8601() : timestamp;

		return moment.utc(timestamp).startOf('day').toISOString();

	}

	static endOfDay(timestamp) {

		timestamp = (_.isUndefined(timestamp) || _.isNull(timestamp)) ? this.getISO8601() : timestamp;

		return moment.utc(timestamp).endOf('day').toISOString();

	}

	static isToday(timestamp) {

		// Technical Debt:  Introduct margin of error to account for transactions that may occur right on the threshold of day.
		return moment.utc().isSame(timestamp, 'd');

	}

	static subtractDays(days, now = moment.utc()) {

		return now.subtract(days, 'd').toISOString();

	}

	static addDays(days, now = moment.utc()) {

		return now.add(days, 'd').toISOString();

	}

	static getDayNumber(timestamp: moment.Moment | null = null) {

		if (timestamp === null) {
			return moment.utc().format('DD');
		}

		return moment.utc(timestamp).format('DD');

	}

	static daysInMonth(timestamp: moment.Moment | null = null) {

		if (timestamp === null) {
			return moment.utc().daysInMonth();
		}
		return moment.utc(timestamp).daysInMonth();

	}

	static now() {

		return this.createTimestampMilliseconds();

	}

	static getYear() {

		return moment.utc().year();

	}

	static nextMonth(day: number | null = null) {

		if (day === null) {
			return moment.utc().add(1, 'month').startOf('month').toISOString();
		}

		return moment.utc().add(1, 'month').startOf('month').add(day, 'day').toISOString();

	}

	static thisMonth(day: number | null = null) {

		if (day === null) {
			return moment.utc().startOf('month').toISOString();
		}

		return moment.utc().startOf('month').add(day, 'day').toISOString();

	}

	static getPreviousMonthStart() {

		return moment.utc().subtract(1, 'month').startOf('month').toISOString();

	}

	static getPreviousMonthEnd() {

		return moment.utc().subtract(1, 'month').endOf('month').toISOString();

	}

	static getDayInSeconds() {

		return 86400;

	}

	static delay(time) {

		if (!numberutilities.isNatural(time)) {
			throw eu.getError('server', 'Timestamp.delay assumes time is an natural integer.');
		}

		return (passthrough) => {
			return new Promise((resolve) => {
				return setTimeout(
					() => {
						return resolve(passthrough);
					},
					time
				);
			});
		};

	}

	static createTimestampSeconds() {

		return moment().unix();

	}

	static createTimestampMilliseconds() {

		return moment().unix() * 1000;

	}

	static createDate() {

		return moment.utc().toDate().toUTCString();

	}

	static secondsToDate(timeInSeconds) {

		const date = moment(timeInSeconds * 1000).utc().toDate();

		return date.toUTCString();

	}

	static getTimeDifference(timestampInSeconds) {

		const now = this.createTimestampSeconds();

		return now - timestampInSeconds;

	}

	static toISO8601(timeInSeconds) {

		const date = moment(timeInSeconds * 1000).utc().toDate();

		return this.castToISO8601(date);

	}

	static getISO8601() {

		return this.castToISO8601(moment.utc().toDate());

	}

	static castToISO8601(date_object) {

		if ((date_object instanceof Date)) {

			return date_object.toISOString();

		} else if (_.isString(date_object)) {

			if (this.isISO8601(date_object)) {

				return date_object;

			} else {

				return this.convertToISO8601(date_object);

			}

		}

		throw eu.getError('validation', 'Unrecognized date type: ' + date_object);

	}

	static convertToISO8601(date) {

		return this.castToISO8601(moment(date).utc().toDate());

	}

	static isISO8601(string) {

		const re = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

		return re.test(string);

	}

	static getFormat(format) {

		return moment.utc().format(format);

	}

	static convertToFormat(date, format) {

		return moment(date).utc().format(format);

	}

	static getDaysDifference(timething) {

		const timeInSeconds = this.convertToFormat(timething, 'X');

		const timeDifference = this.getTimeDifference(timeInSeconds);

		return Math.floor((timeDifference / oneDayInSeconds));

	}

	static getSecondsDifference(timething) {

		const timeInSeconds = this.convertToFormat(timething, 'X');

		return Math.abs(this.getTimeDifference(timeInSeconds));

	}

	static dateToTimestamp(date) {

		return this.convertToFormat(date, 'X');

	}

	static getThisHourInISO8601() {

		const time = moment.utc().minute(0).second(0).millisecond(0);

		return this.convertToISO8601(time.format());

	}

	static getLastHourInISO8601() {

		const time = moment.utc().subtract(1, 'h').minute(0).second(0).millisecond(0);

		return this.convertToISO8601(time.format());

	}

	static withinLastMinute(date) {

		const differenceInSeconds = moment.utc().diff(date, 'seconds');

		return differenceInSeconds < 60;

	}

	static differenceInMiliseconds(start, end) {

		start = moment.utc(start);

		const duration = moment.duration(start.diff(end));

		return duration.asMilliseconds();

	}

	static yesterday() {

		return moment().utc().add(-1, 'days').toDate();

	}

	static tomorrow() {

		return moment().utc().add(1, 'days').toDate();

	}

	static upcoming(dayname: string, week_offset = 0, at?: string) {

		const day_translation = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

		if (!_.includes(day_translation, _.toLower(dayname))) {

			throw eu.getError('server', 'Bad day name: ' + dayname);

		}

		week_offset = (week_offset * 7);

		const beginning_of_day = moment().utc().day(_.indexOf(day_translation, _.toLower(dayname)) + week_offset).startOf('day');

		if (at !== undefined) {

			const time = moment(at, 'HH:mm a').utc();

			beginning_of_day.add(time.hour(), 'hours');

			beginning_of_day.add(time.minute(), 'minutes');

		}

		return this.castToISO8601(beginning_of_day.toDate());

	}

}
