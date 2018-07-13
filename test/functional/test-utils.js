class TestUtils {

	setGlobalUser(parameters) {
		let account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c'; // Default values.
		let user = 'admin.user@test.com';

		if (parameters) {
			if (parameters.account) {
				account = parameters.account;
			}

			if (parameters.user) {
				user = parameters.user;
			}
		}

		global.user = {
			acl: [{
				account: {
					id: account
				},
				role: {
					permissions: {
						allow: ['*'],
						deny: []
					}
				}
			}],
			id: user
		};

		global.account = global.user.acl[0].account.id;
	}

	/**
     * Set the variables for local exectution.
     * Technical Debt: this should be read from serverless.yml and/or config/local/site.yml
     */
	setEnvironmentVariables() {
		process.env.site_jwt_secret_key = 'J-LR3RIOxrHIe-MH-NftFYr7VFTB8xO8W8T451s35hJ0-V55aGdUQGCl1hGZ1OG1';

		process.env.stage = 'local';
		process.env.transaction_key = 'z85t6nusfb3hafwnpw57pmdbnr9t9z5jmhjpv';
		process.env.stage = 'local';
		process.env.AWS_PROFILE = 'six';

	}
}

module.exports = new TestUtils();
