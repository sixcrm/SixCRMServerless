let chai = require('chai');
let expect = chai.expect;

describe('controllers/Rebill.js', () => {
    let rebillController;
    const oneDayInSeconds = 86400;

    function nowInSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    before(() => {
        rebillController = require('../../../controllers/Rebill');
    });

    describe('calculate rebill', () => {
        it('should calculate rebill', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 1,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill.billdate).to.equal((aProductSchedule.schedule[0].period * oneDayInSeconds) + nowInSeconds());
            expect(rebill.product).to.be.equal(aProductSchedule.schedule[0].product_id);
            expect(rebill.amount).to.be.equal(aProductSchedule.schedule[0].price);
        });

        it('should calculate rebill for schedules with no end', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 1,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill.billdate).to.equal((aProductSchedule.schedule[0].period * oneDayInSeconds) + nowInSeconds());
            expect(rebill.product).to.be.equal(aProductSchedule.schedule[0].product_id);
            expect(rebill.amount).to.be.equal(aProductSchedule.schedule[0].price);
        });

        it('should calculate rebill for first eligible schedule', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    { // not eligible
                        start: 15,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    },
                    { // not eligible
                        start: 15,
                        end: 30,
                        period: 1,
                        product_id: 66,
                        price: 200
                    },
                    { // eligible
                        start: 1,
                        end: 30,
                        period: 1,
                        product_id: 99,
                        price: 300
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill.billdate).to.equal((aProductSchedule.schedule[2].period * oneDayInSeconds) + nowInSeconds());
            expect(rebill.product).to.be.equal(aProductSchedule.schedule[2].product_id);
            expect(rebill.amount).to.be.equal(aProductSchedule.schedule[2].price);
        });

        it('returns false when a day in cycle is after the end of schedule', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 1,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 31;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill).to.be.false;
        });

        it('returns false when a day in cycle is before the start of schedule', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 15,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill).to.be.false;
        });
    });

    describe('should calculate day in cycle', () => {
        it('for today', () => {
            expect(rebillController.calculateDayInCycle(nowInSeconds())).to.equal(0);
        });

        it('for tomorrow', () => {
            expect(rebillController.calculateDayInCycle(nowInSeconds() + oneDayInSeconds)).to.equal(-1);
        });

        it('for yesterday', () => {
            expect(rebillController.calculateDayInCycle(nowInSeconds() - oneDayInSeconds)).to.equal(1);
        });
    });
});
