

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');

module.exports = class AccessKey{

	static generateAccessKey(){

		du.debug('Generate Access Key');

		return randomutilities.createRandomString(40);

	}

	static generateSecretKey(){

		du.debug('Generate Secret Key');

		return hashutilities.toSHA1(randomutilities.createRandomString(40));

	}

}
