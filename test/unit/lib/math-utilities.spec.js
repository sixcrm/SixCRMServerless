const chai = require('chai');
const expect = chai.expect;
const mathUtilities = global.SixCRM.routes.include('lib', 'math-utilities.js');

describe('lib/math-utilities', () => {

    describe('safePercentage', () => {

        it('returns 0.00 when denominator is 0', () => {
            expect(mathUtilities.safePercentage(1, 0)).to.equal(0.00.toFixed(2));
        });
    });

    describe('formatToPercentage', () => {

        it('returns specified value with default precision', () => {
            expect(mathUtilities.formatToPercentage(1)).to.equal(1.00.toFixed(2));
        });
    });

    describe('sum', () => {

        it('throws error when argumentation is not an array', () => {
            try{
                mathUtilities.sum(1, 1);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'Unexpected argumentation to mathutilities.calculateSum');
            }
        });

        it('throws error when array argument is not a number', () => {
            try{
                mathUtilities.sum(['a','b'], 1);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'Array argument to mathutilities.calculateSum must be numeric');
            }
        });

        it('returns base itself when array is empty', () => {
            expect(mathUtilities.sum([], 1)).to.equal(1);
        });
    });

    describe('power', () => {

        it('throws error when base is not a number', () => {
            try{
                mathUtilities.power('a', 1);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'MathUtilities.power assumes requires a numeric base.');
            }
        });

        it('throws error when exponent is not a number', () => {
            try{
                mathUtilities.power(1, 'a');
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'MathUtilities.power assumes requires a numeric exponent.');
            }
        });
    });

    describe('calculateLSS', () => {

        it('throws error when specified arguments are not arrays', () => {
            try{
                mathUtilities.calculateLSS(1, 1);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'Unexpected argumentation to mathutilities.calculateLSS');
            }
        });

        it('throws error when arrays are not the same length', () => {
            try{
                mathUtilities.calculateLSS([1], [1, 2]);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'Array arguments to mathutilities.calculateLSS must be of equivalent length');
            }
        });

        it('throws error when array is empty', () => {
            try{
                mathUtilities.calculateLSS([], []);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'Array arguments to mathutilities.calculateLSS must be of non-zero length');
            }
        });

        it('throws error when array arguments are not numbers', () => {
            try{
                mathUtilities.calculateLSS(['a'], ['b']);
            }catch(error){
                expect(error.message).to.equal('[500] ' + 'Array arguments to mathutilities.calculateLSS must be numeric');
            }
        });
    });
});