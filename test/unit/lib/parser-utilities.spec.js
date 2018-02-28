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
            expect(parserutilities.getTokens(test_case.test)).to.deep.equal(test_case.result);
          });

        });

    });

});
