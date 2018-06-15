

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;

module.exports = class UserSigningStringHelperController{

	static generateSigningString(){

		du.debug('Generate Signing String');

		return randomutilities.createRandomString(40);

	}

}
