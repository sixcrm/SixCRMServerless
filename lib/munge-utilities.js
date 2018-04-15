
let crypto = require('crypto');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const random = global.SixCRM.routes.include('lib', 'random.js');

class MungeUtilities {

	static munge(mungestring){

		du.debug('Munge');

		let random_string = random.createRandomString(20);

		let hash = crypto.createHash('sha1').update(mungestring+random_string).digest('hex');

		return hash;

	}

}

module.exports = MungeUtilities;
