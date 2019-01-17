import * as chai from 'chai';
const expect = chai.expect;
import serverlessutilities from '../../../src/util/serverless-utilities';

describe('lib/serverless-utilities', () => {

	it('throws error when specified function is invalid', () => {

		try {
			serverlessutilities.loadConfig('a_stage', 'non_existing_function');
		} catch (error) {
			expect(error.message).to.equal('[500] The function "non_existing_function" is not defined in the serverless.yml file.');
		}
	});
});
