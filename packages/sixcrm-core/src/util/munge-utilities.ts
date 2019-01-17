import * as crypto from 'crypto';

import du from './debug-utilities';
import random from './random';

export default class MungeUtilities {

	static munge(mungestring) {

		du.debug('Munge');

		const random_string = random.createRandomString(20);

		const hash = crypto.createHash('sha1').update(mungestring + random_string).digest('hex');

		return hash;

	}

}
