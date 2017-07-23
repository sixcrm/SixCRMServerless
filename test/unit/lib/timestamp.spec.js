let Timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let chai = require('chai');
let expect = chai.expect;

const frozenNow = 1487768599196;  // '2017-02-22T13:03:19.196Z';
const frozenNowAsISOString = 'Wed, 22 Feb 2017 13:03:19 GMT';
const frozenNowInSeconds = 1487768599;
const oneDayInSeconds = 86400;

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

        function givenTimeIsFrozen() {
            Date.now = () => {
                return frozenNow;
            }
        }
    });

    describe('should calculate day difference', () => {
        it('for today', () => {
            expect(Timestamp.getDaysDifference(nowInSeconds())).to.equal(0);
        });

        it('for tomorrow', () => {
            expect(Timestamp.getDaysDifference(nowInSeconds() + oneDayInSeconds)).to.equal(-1);
        });

        it('for yesterday', () => {
            expect(Timestamp.getDaysDifference(nowInSeconds() - oneDayInSeconds)).to.equal(1);
        });

        function nowInSeconds() {
            return Timestamp.createTimestampSeconds();
        }
    });
});
