const chai = require('chai');
const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const BBPromise = require('bluebird');

describe('lib/timer', () => {

    it('throws error if timer start is not set', () => {

        const timer = global.SixCRM.routes.include('lib', 'timer.js');

        delete timer.start;

        try{
            timer.get();
        }catch(error){
            expect(error.message).to.equal('[500] You must set the timer with "set" before calling "get".');
        }
    });

    it('returns elapsed time', () => {

				const timer = global.SixCRM.routes.include('lib', 'timer.js');

				timer.start = timestamp.createTimestampMilliseconds();

				return BBPromise.delay(1000)
				.then(() => {

					const elapsed = timer.get();

					expect(elapsed).to.be.greaterThan(0);
					expect(elapsed).to.be.greaterThan(900).and.to.be.lessThan(1100);

					return;
				});

    });

    it('successfully sets timer', () => {

        const timer = global.SixCRM.routes.include('lib', 'timer.js');

        timer.set();

        expect(timer.start).to.be.defined;
        expect(timestamp.getTimeDifference(timer.start)).to.be.below(5);
    });
});