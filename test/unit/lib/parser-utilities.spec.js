const chai = require('chai');
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

describe('lib/parser-utilities', () => {

	describe('getTokens', () => {

		it('returns all tokens', () => {

			let test_cases = [
				{
					test: 'no tokens',
					result: []
				},
				{
					test: 'There is {{one}} token',
					result: ['one']
				},
				{
					test: 'There are {{more}} than {{one}} tokens',
					result: ['more','one']
				},
				{
					test: 'There are {{multiple}} tokens but there should not be {{multiple}} entires in the {{token_array}} for the same token.',
					result: ['multiple', 'token_array']
				}
			];

			arrayutilities.map(test_cases, test_case => {
				let test_result = parserutilities.getTokens(test_case.test);
				expect(test_result).to.deep.equal(test_case.result);
			});

		});

	});

	describe('parse', () => {

		it('successfully parses the tokens into the content strings', () => {

			let test_data = {
				one: 'a',
				more: 'so many',
				multiple: 'lots of',
				token_array: 'token array'
			};

			let test_cases = [
				{
					test: 'no tokens',
					result: 'no tokens'
				},
				{
					test: 'There is {{one}} token',
					result: 'There is a token'
				},
				{
					test: 'There are {{more}} more than just {{one}} single token',
					result: 'There are so many more than just a single token'
				},
				{
					test: 'There are {{multiple}} tokens but there should not be {{multiple}} entries in the {{token_array}} for the same token.',
					result: 'There are lots of tokens but there should not be lots of entries in the token array for the same token.'
				}
			];

			arrayutilities.map(test_cases, test_case => {
				let test_result = parserutilities.parse(test_case.test, test_data);
				expect(test_result).to.deep.equal(test_case.result);
			});

		});

	});

});
