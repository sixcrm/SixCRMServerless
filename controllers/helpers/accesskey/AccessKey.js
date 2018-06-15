

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const hashutilities = require('@sixcrm/sixcrmcore/util/hash-utilities').default;
const randomutilities = require('@sixcrm/sixcrmcore/util/random').default;

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
