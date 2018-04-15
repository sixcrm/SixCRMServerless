

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');

module.exports = class UserSigningStringHelperController{

	static generateSigningString(){

		du.debug('Generate Signing String');

		return randomutilities.createRandomString(40);

	}

}
