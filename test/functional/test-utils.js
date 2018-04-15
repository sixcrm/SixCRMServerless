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
		process.env.site_jwt_secret_key = 'pO9HJmVXzTOagNP-xW9Es8-s0HGQt28hqlvAPJx6e6rHeryvnyBGDn-LJn_80XdV';

		process.env.stage = 'local';
		process.env.transaction_key = 'ashdaiuwdaw9d0u197f02ji9ujoja90juahwi';
		process.env.stage = 'local';
		process.env.AWS_PROFILE = 'six';

	}
}

module.exports = new TestUtils();
