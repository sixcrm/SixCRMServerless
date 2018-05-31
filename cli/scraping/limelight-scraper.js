const request = require('request-promise');

module.exports = class LimelightScraper {

	constructor(host, user, password) {

		this._url = `https://${host}/admin`;
		this._user = user;
		this._password = password;

	}

	async signOn() {

		const res = await request.post({
			url: `${this._url}/login.php`,
			followRedirect: true,
			simple: false,
			resolveWithFullResponse: true,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': '*/*',
				'User-Agent': 'Restler for node.js'
			},
			form: {
				login_url: '',
				admin_name: this._user,
				admin_pass: this._password
			}
		});

		const cookieHeader = res.headers['set-cookie'];

		if (!cookieHeader || cookieHeader.length < 1) {

			throw new Error('Failed to get sign on cookie for post');

		}

		const cookie = cookieHeader[0];

		const dashboard = await request.get({
			url: `${this._url}/dashboard.php`,
			headers: {
				'Content-Type': 'text/html; charset=UTF-8',
				'Accept': '*/*',
				'User-Agent': 'Restler for node.js',
				'Cookie': cookie
			}
		});

		if (dashboard.indexOf('Sign-In') > -1) {

			throw new Error('Failed to log into Limelight');

		}

		return cookie;

	}

}
