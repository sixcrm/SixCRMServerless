const randomutilities = require('@6crm/sixcrmcore/util/random').default;

module.exports = class UserSigningStringHelperController{

	static generateSigningString(){
		return randomutilities.createRandomString(40);

	}

}
