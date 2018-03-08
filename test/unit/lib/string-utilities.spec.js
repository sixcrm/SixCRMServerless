let stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
let chai = require('chai');
let expect = chai.expect;

describe('lib/string-utilities', () => {

    describe('isMatch', () => {

      it('returns true when string matches regex', () => {
          expect(stringutilities.isMatch('abc', /^[a-z]{3}$/)).to.equal(true);
      });

      it('returns false when string does not match regex', () => {
          expect(stringutilities.isMatch('abc', /^[a-z]{1}$/)).to.equal(false);
      });

      it('fails when string is not a string ', () => {

        try{
          stringutilities.isMatch({}, /^[a-z]{1}$/);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
        }

        try{
          stringutilities.isMatch([], /^[a-z]{1}$/);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
        }

        try{
          stringutilities.isMatch(null, /^[a-z]{1}$/);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
        }

        try{
          stringutilities.isMatch(123, /^[a-z]{1}$/);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
        }

        try{
          stringutilities.isMatch(/123/, /^[a-z]{1}$/);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
        }

      });

    });

    describe('isRegex', () => {

      it('returns true when string is a regular expression', () => {
        expect(stringutilities.isRegex(/^[abc]$/)).to.equal(true);
      });

      it('returns false when string is not a regular expression', () => {
        expect(stringutilities.isRegex('hi there stanley')).to.equal(false);
        expect(stringutilities.isRegex({})).to.equal(false);
        expect(stringutilities.isRegex([])).to.equal(false);
        expect(stringutilities.isRegex(123)).to.equal(false);
        expect(stringutilities.isRegex(null)).to.equal(false);
        expect(stringutilities.isRegex(false)).to.equal(false);
      });

      it('returns throws an error when fatal is true and it does not match', () => {
        try{
          stringutilities.isRegex('hi there stanley', true);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
        }

        try{
          stringutilities.isRegex({}, true);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
        }

        try{
          stringutilities.isRegex(null, true);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
        }

        try{
          stringutilities.isRegex(false, true);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
        }

        try{
          stringutilities.isRegex(123, true);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
        }

        try{
          stringutilities.isRegex([], true);
        }catch(error){
          expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
        }

      });

    });

    describe('isUUID', () => {
        it('returns true for valid UUIDs', () => {
            let uuids = [
                '1971204d-5b76-4c57-a3ad-cf54f994759c',
                '028fb88c-7fdf-4637-af1e-2b48683c9688'
            ];

            uuids.forEach((uuid) => {
                expect(stringutilities.isUUID(uuid)).to.equal(true, uuid + ' should be valid');
            });

        });

        it('returns false for invalid UUIDs', () => {
            let uuids = [
                [],
                null,
                {},
                { uuid: '1971204d-5b76-4c57-a3ad-cf54f994759c'},
                '1234',
                '1971204d-5b76-4c57-a3ad-cf54f994759c-0000'
            ];

            uuids.forEach((uuid) => {
                expect(stringutilities.isUUID(uuid)).to.equal(false, uuid + ' should not be valid');
            });

        });

    });

    describe('isEmail', () => {
        it('returns true for valid emails', () => {
            let emails = [
                'email@example.com',
                'test.name@sixcrm.com'
            ];

            emails.forEach((email) => {
                expect(stringutilities.isEmail(email)).to.equal(true, email + ' should be valid');
            });

        });

        it('returns false for invalid emails', () => {
            let emails = [
                [],
                null,
                {},
                { email: 'test@example.com'},
                'test.name@',
                '@example.com'
            ];

            emails.forEach((email) => {
                expect(stringutilities.isEmail(email)).to.equal(false, email + ' should not be valid');
            });

        });

    });

    describe('matchGroup', () => {
      it('returns match if there is one', () => {
        expect(stringutilities.matchGroup('abcdef', /abc(def)/g, 1)).to.deep.equal(['def']);
      });

      it('returns empty results when group number is out of scope', () => {
          expect(stringutilities.matchGroup('abcdef', /abc(def)/g, 2)).to.deep.equal([]);
          expect(stringutilities.matchGroup('abcdef', /abc(def)/g, -1)).to.deep.equal([]);
      });

      it('returns whole match when group number is 0', () => {
          expect(stringutilities.matchGroup('abcdef', /abc(def)/g, 0)).to.deep.equal(['abcdef']);
      });

      it('assumes default group number to be 0', () => {
          expect(stringutilities.matchGroup('abcdef', /abc(def)/g)).to.deep.equal(['abcdef']);
      });
    });

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

    describe('isNumeric', () => {

        it('throws error when value is not numeric', () => {
            try {
                stringutilities.isNumeric('notNumeric', true);
            }catch(error) {
                expect(error.message).to.equal('[500] "notNumeric" is not numeric');
            }
        });

    });

    describe('uppercaseFirst', () => {

        it('returns string with uppercase first letter', () => {
            expect(stringutilities.uppercaseFirst('any string')).to.equal('Any string');
        });

    });

    describe('removeNonAlphaNumeric', () => {

        it('returns only alpha numeric characters from string', () => {
            expect(stringutilities.removeNonAlphaNumeric('te*st+1-2.3')).to.equal('test123');
        });

    });

    describe('capitalize', () => {

        it('returns value with uppercase first character if that character is a string', () => {
            expect(stringutilities.capitalize('any value 123')).to.equal('Any value 123');
        });

    });

    describe('toPascalCase', () => {

        it('returns uppercase for first letter and after every underscore', () => {
            expect(stringutilities.toPascalCase('any_value')).to.equal('AnyValue');
        });

    });

    describe('matchAll', () => {

        it('returns string that matches appointed regex', () => {

            let anyValue = ['t', 's', 't']; //regex result of string 'test' without letter 'e'

            let anyRegex = /[^e]/g;

            expect(stringutilities.matchAll('test', anyRegex)).to.deep.equal(anyValue);
        });

        it('returns empty array if nothing matches appointed regex', () => {

            let anyRegex = /[abc]/g;

            expect(stringutilities.matchAll('test', anyRegex)).to.deep.equal([]);
        });

    });

});
