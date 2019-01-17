import stringutilities from '../../../src/util/string-utilities';
import * as chai from 'chai';
const expect = chai.expect;

describe('lib/string-utilities', () => {

	describe('isMatch', () => {

		it('returns true when string matches regex', () => {
			expect(stringutilities.isMatch('abc', /^[a-z]{3}$/)).to.equal(true);
		});

		it('returns false when string does not match regex', () => {
			expect(stringutilities.isMatch('abc', /^[a-z]{1}$/)).to.equal(false);
		});

		it('fails when string is not a string ', () => {

			try {
				stringutilities.isMatch({} as any, /^[a-z]{1}$/);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
			}

			try {
				stringutilities.isMatch([] as any, /^[a-z]{1}$/);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
			}

			try {
				stringutilities.isMatch(null as any, /^[a-z]{1}$/);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
			}

			try {
				stringutilities.isMatch(123 as any, /^[a-z]{1}$/);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
			}

			try {
				stringutilities.isMatch(/123/ as any, /^[a-z]{1}$/);
			} catch (error) {
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
			try {
				stringutilities.isRegex('hi there stanley', true);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
			}

			try {
				stringutilities.isRegex({}, true);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
			}

			try {
				stringutilities.isRegex(null, true);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
			}

			try {
				stringutilities.isRegex(false, true);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
			}

			try {
				stringutilities.isRegex(123, true);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
			}

			try {
				stringutilities.isRegex([], true);
			} catch (error) {
				expect(error.message).to.equal('[500] StringUtilities.isRegex argument is not an regular expression.');
			}

		});

	});

	describe('isUUID', () => {
		it('returns true for valid UUIDs', () => {
			const uuids = [
				'1971204d-5b76-4c57-a3ad-cf54f994759c',
				'028fb88c-7fdf-4637-af1e-2b48683c9688'
			];

			uuids.forEach((uuid) => {
				expect(stringutilities.isUUID(uuid)).to.equal(true, uuid + ' should be valid');
			});

		});

		it('returns false for invalid UUIDs', () => {
			const uuids: any[] = [
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
			const emails = [
				'email@example.com',
				'test.name@sixcrm.com'
			];

			emails.forEach((email) => {
				expect(stringutilities.isEmail(email)).to.equal(true, email + ' should be valid');
			});

		});

		it('returns false for invalid emails', () => {
			const emails: any[] = [
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
			} catch (error) {
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

			const anyValue = ['t', 's', 't']; // regex result of string 'test' without letter 'e'

			const anyRegex = /[^e]/g;

			expect(stringutilities.matchAll('test', anyRegex)).to.deep.equal(anyValue);
		});

		it('returns empty array if nothing matches appointed regex', () => {

			const anyRegex = /[abc]/g;

			expect(stringutilities.matchAll('test', anyRegex)).to.deep.equal([]);
		});

	});

	describe('stripHTML', () => {

		it('removes HTML tags', () => {

			// example of valid html tags
			expect(stringutilities.stripHTML(
				'<li>Coffee, </li>' +
				'<li>Tea, </li>' +
				'<li>Milk</li>' +
				'</ul>')).to.equal('Coffee, Tea, Milk');

			expect(stringutilities.stripHTML('<table>' +
				'<tr>' +
				'<td>any_value</td>' +
				'</tr>' +
				'</table>')).to.equal('any_value');

			expect(stringutilities.stripHTML('<p><b>any_value</b></p>')).to.equal('any_value');

			// example of invalid html tags
			expect(stringutilities.stripHTML('<p>any_value/b></p>')).to.equal('any_value/b>');
			expect(stringutilities.stripHTML('li>any_value</li>')).to.equal('li>any_value');
		});
	});

	describe('escapeCharacter', () => {

		it('escapes character', () => {
			// escapes every letter 'u' occurrence
			expect(stringutilities.escapeCharacter('any_value', 'u')).to.equal('any_val\\ue');

			// escapes every occurrence of number 4
			expect(stringutilities.escapeCharacter('4ny_v4lue', '4')).to.equal('\\4ny_v\\4lue');

			// takes first character and escapes every letter 'o' occurrence
			expect(stringutilities.escapeCharacter('some_random_value_for_testing_purposes', 'om'))
				.to.equal('s\\ome_rand\\om_value_for_testing_purposes');
		});

	});

	describe('replaceAll', () => {

		it('replaces every occurrence of specified characters', () => {

			expect(stringutilities.replaceAll('szme_randzm_value_fzr_testing_purpzses', 'z', 'o'))
				.to.equal('some_random_value_for_testing_purposes');

			expect(stringutilities.replaceAll('any_value', 'z', 's'))
				.to.equal('any_value');

			expect(stringutilities.replaceAll('4ny_v4lue', '4', 'a'))
				.to.equal('any_value');

			expect(stringutilities.replaceAll('sqe_randq_value', 'q', 'om'))
				.to.equal('some_random_value');
		});

	});

});
