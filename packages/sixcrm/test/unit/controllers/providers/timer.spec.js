const chai = require('chai');
const expect = chai.expect;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

describe('controllers/providers/timer', () => {

	it('throws error if timer start is not set', () => {

		const Timer = global.SixCRM.routes.include('controllers', 'providers/timer.js');
		const timer = new Timer();

		delete timer.start;

		try{
			timer.get();
		}catch(error){
			expect(error.message).to.equal('[500] You must set the timer with "set" before calling "get".');
		}
	});

	xit('returns elapsed time', (done) => {

		const Timer = global.SixCRM.routes.include('controllers', 'providers/timer.js');
		const timer = new Timer();

		timer.start = timestamp.createTimestampMilliseconds();

		setTimeout(function () {

			const elapsed = timer.get();

			expect(elapsed).to.be.greaterThan(0);
			expect(elapsed).to.be.greaterThan(200).and.to.be.lessThan(400);
			done();

		}, 300);

	});

	it('successfully sets timer', () => {

		const Timer = global.SixCRM.routes.include('controllers', 'providers/timer.js');
		const timer = new Timer();

		timer.set();

		expect(timer.start).to.be.defined;
		expect(timestamp.getTimeDifference(timer.start)).to.be.below(5);
	});
});
