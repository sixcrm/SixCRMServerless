import * as jwt from 'jsonwebtoken';
import du from './debug-utilities';
import eu from './error-utilities';
import numberutilities from './number-utilities';
import timestamp from './timestamp.js';

export default class JWTUtilities {

	static createSiteJWT(user) {

		du.debug('Create Site JWT');

		const now = timestamp.createTimestampSeconds();

		const jwt_contents = {
			email: user.id,
			email_verified: true,
			picture: "",
			iss: "https://sixcrm.auth0.com/",
			sub: "",
			aud: "",
			exp: (now + numberutilities.toNumber(global.SixCRM.configuration.site_config.jwt.site.expiration)),
			iat: now
		};

		return this._generateJWT(jwt_contents, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	}

	static _generateJWT(body, secret) {

		du.debug('Generate JWT');

		const test_jwt = jwt.sign(body, secret);

		if (!jwt.verify(test_jwt, secret)) {
			throw eu.getError('server', 'created invalid token');
		}

		return test_jwt;

	}

}
