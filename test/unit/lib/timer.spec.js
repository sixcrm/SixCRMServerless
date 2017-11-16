const chai = require('chai');
const expect = chai.expect;

const frozenNow = 1510820555711; //Thu, 16 Nov 2017 08:28:38 GMT

function givenTimeIsFrozen() {
    Date.now = () => {
        return frozenNow;
    }
}

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

        givenTimeIsFrozen();

        const timer = global.SixCRM.routes.include('lib', 'timer.js');

        timer.start = 1487768599196;  // Wed, 22 Feb 2017 13:03:19 GMT;

        let elapsed = timer.get();

        expect(elapsed).to.equal(23051956515);
    });

    it('returns elapsed time with info about execution time', () => {

        givenTimeIsFrozen();

        const timer = global.SixCRM.routes.include('lib', 'timer.js');

        timer.start = 1487768599196;  // Wed, 22 Feb 2017 13:03:19 GMT;

        let elapsed = timer.get(true);

        expect(elapsed).to.equal(23051956515);
    });
});