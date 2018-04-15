const chai = require('chai');
const expect = chai.expect;

describe('lib/serverless-utilities', () => {

	it('throws error when specified function is invalid', () => {
		const serverlessutilities = global.SixCRM.routes.include('lib', 'serverless-utilities.js');

		try{
			serverlessutilities.loadConfig('a_stage', 'non_existing_function');
		}catch(error){
			expect(error.message).to.equal('[500] The function "non_existing_function" is not defined in the serverless.yml file.');
		}
	});
});