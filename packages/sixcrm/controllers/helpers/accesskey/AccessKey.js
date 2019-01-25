const hashutilities = require('@6crm/sixcrmcore/lib/util/hash-utilities').default;
const randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;

module.exports = class AccessKey{

	static generateAccessKey(){
		return randomutilities.createRandomString(40);

	}

	static generateSecretKey(){
		return hashutilities.toSHA1(randomutilities.createRandomString(40));

	}

}
