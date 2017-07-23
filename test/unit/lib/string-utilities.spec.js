let stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
let chai = require('chai');
let expect = chai.expect;

describe('lib/string-utilities', () => {

    describe('abbreviate', () => {

        it('returns same string if shorter than limit', () => {
            expect(stringutilities.abbreviate('abc', 5)).to.equal('abc');
        });

        it('returns abbreviated string if longer than limit', () => {
            expect(stringutilities.abbreviate('Test test test', 10)).to.equal('Test te...');
        });

        it('doesn\'t abbreviate text on space', () => {
            expect(stringutilities.abbreviate('Test test test', 8)).not.to.equal('Test ...');
            expect(stringutilities.abbreviate('Test test test', 8)).to.equal('Test...');
        });

    });

});
