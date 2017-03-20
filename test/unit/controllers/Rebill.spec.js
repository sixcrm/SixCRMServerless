let chai = require('chai');
let expect = chai.expect;

describe('controllers/Rebill.js', () => {
    let rebillController;

    before(() => {
        rebillController = require('../../../controllers/Rebill');
    });

    describe('should calculate day in cycle', () => {
        let oneDayInSeconds = 86400;

        it('for today', () => {
            expect(rebillController.calculateDateInCycle(nowInSeconds())).to.equal(0);
        });

        it('for tomorrow', () => {
            expect(rebillController.calculateDateInCycle(nowInSeconds() + oneDayInSeconds)).to.equal(-1);
        });

        it('for yesterday', () => {
            expect(rebillController.calculateDateInCycle(nowInSeconds() - oneDayInSeconds)).to.equal(1);
        });

        function nowInSeconds() {
            return Math.floor(Date.now() / 1000);
        }

    });
});
