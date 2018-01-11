let Timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let chai = require('chai');
let expect = chai.expect;

const frozenNow = 1487768599196;  // '2017-02-22T13:03:19.196Z';
const frozenNowAsISO8601 = '2017-02-22T13:03:19.196Z';
const frozenNowAsISOString = 'Wed, 22 Feb 2017 13:03:19 GMT';
const frozenNowInSeconds = 1487768599;
const oneDayInMiliseconds = 86400000;

describe('lib/timestamp', () => {
    describe('timestamp', () => {

        it('should create timestamp in seconds', () => {
            // given
            givenTimeIsFrozen();

            // when
            let timestampInSeconds = Timestamp.createTimestampSeconds();

            // then
            expect(timestampInSeconds).to.equal(frozenNowInSeconds);
        });

        it('should create timestamp in milliseconds', () => {
            // given
            givenTimeIsFrozen();

            // when
            let timestampInMilliseconds = Timestamp.createTimestampMilliseconds();

            // then
            expect(timestampInMilliseconds).to.equal(frozenNow);
        });

        it('should create a date', () => {
            // given
            givenTimeIsFrozen();

            // when
            let createdDate = Timestamp.createDate();

            // then
            expect(createdDate).to.equal(frozenNowAsISOString);
        });

        it('calculates date from seconds', () => {
            // given
            givenTimeIsFrozen();

            // when
            let dateFromSeconds = Timestamp.secondsToDate(frozenNowInSeconds);

            // then
            expect(dateFromSeconds).to.equal(frozenNowAsISOString);
        });

        it('calculates difference in seconds between now and given time', () => {
            // given
            givenTimeIsFrozen();
            let expectedDifferenceInSeconds = 10;

            // when
            let differenceInSeconds = Timestamp.getTimeDifference(frozenNowInSeconds - expectedDifferenceInSeconds);

            // then
            expect(differenceInSeconds).to.equal(expectedDifferenceInSeconds);
        });

        it('retrieves date rounded by this hour', () => {
            // given
            givenTimeIsFrozen();

            // when
            let this_hour = Timestamp.getThisHourInISO8601();

            // then
            expect(this_hour).to.equal('2017-02-22T13:00:00.000Z');
        });


        it('retrieves date rounded by last hour', () => {
            // given
            givenTimeIsFrozen();

            // when
            let last_hour = Timestamp.getLastHourInISO8601();

            // then
            expect(last_hour).to.equal('2017-02-22T12:00:00.000Z');
        });

        it('successfully retrieves format from moment', () => {

            let frozenDate = new Date(frozenNowAsISO8601);

            let yearFromFrozenDate = frozenDate.getFullYear();

            expect(Timestamp.getFormat('YYYY')).to.equal(yearFromFrozenDate.toString());
        });

        it('returns false when appointed value is not according to ISO8601', () => {
            let invalidDate = 'a12bc3';

            expect(Timestamp.isISO8601(invalidDate)).to.be.false;
        });

        it('returns date converted to ISO8601', () => {
            // given
            givenTimeIsFrozen();

            expect(Timestamp.convertToISO8601(frozenNow)).to.equal(frozenNowAsISO8601);
        });

        it('returns date as ISO8601', () => {

            expect(Timestamp.castToISO8601(frozenNowAsISO8601)).to.equal(frozenNowAsISO8601);
        });

        it('returns date converted to ISO8601 from appointed string', () => {

            let convertedDate = '2017-02-22T13:03:19.000Z';

            expect(Timestamp.castToISO8601(frozenNowAsISOString)).to.equal(convertedDate);
        });

        it('returns validation error when date type is invalid', () => {

            let invalidDate = -1;

            try {
                Timestamp.castToISO8601(invalidDate);
            }catch(error){
                expect(error.message).to.equal('[500] Unrecognized date type: ' + invalidDate);
            }
        });

        it('returns error when specified time is not an natural integer', () => {

            try {
                Timestamp.delay(-1);
            }catch(error){
                expect(error.message).to.equal('[500] Timestamp.delay assumes time is an natural integer.');
            }
        });

        function givenTimeIsFrozen() {
            Date.now = () => {
                return frozenNow;
            }
        }
    });

    describe('should calculate day difference', () => {
        it('for today', () => {
            expect(Timestamp.getDaysDifference(nowInMilliseconds())).to.equal(0);
        });

        it('for tomorrow', () => {
            expect(Timestamp.getDaysDifference(nowInMilliseconds() + oneDayInMiliseconds)).to.equal(-1);
        });

        it('for yesterday', () => {
            expect(Timestamp.getDaysDifference(nowInMilliseconds() - oneDayInMiliseconds)).to.equal(1);
        });

        function nowInMilliseconds() {
            return Timestamp.createTimestampMilliseconds();
        }
    });

    describe('should calculate seconds difference', () => {
        it('for now', () => {
            expect(Timestamp.getSecondsDifference(nowInMilliseconds())).to.equal(0);
        });

        it('for 5 seconds', () => {
            expect(Timestamp.getSecondsDifference(nowInMilliseconds() - 5000)).to.equal(5);
        });

        it('for minus 5 seconds', () => {
            expect(Timestamp.getSecondsDifference(nowInMilliseconds() + 5000)).to.equal(5);
        });

        it('for one minute', () => {
            expect(Timestamp.getSecondsDifference(nowInMilliseconds() + 60000)).to.equal(60);
        });

        function nowInMilliseconds() {
            return Timestamp.createTimestampMilliseconds();
        }
    });
});
