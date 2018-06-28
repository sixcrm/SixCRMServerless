

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const randomutilities = require('@6crm/sixcrmcore/util/random').default;

module.exports = class UserSigningStringHelperController{

	static generateSigningString(){

		du.debug('Generate Signing String');

		return randomutilities.createRandomString(40);

	}

}
