
const request = require('supertest');
const _ = require('lodash');

const tu = global.SixCRM.routes.include('lib','test-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');

module.exports = class IntegrationTest {

	constructor(){

		this.endpoint = global.integration_test_config.endpoint;
		this.account = global.test_accounts[1];
		this.user = global.test_users[0];
		this.test_jwt = tu.createTestAuth0JWT(this.user.email, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	}

	executeQuery(query, code = 200){

		du.debug('Execute Query');

		let required_properties = ['endpoint', 'account', 'test_jwt'];

		arrayutilities.map(required_properties, (required_property) => {
			if(!_.has(this, required_property)){
				throw eu.getError('server', 'IntegrationTest.executeQuery requires "'+required_property+'" to be set.');
			}
		});

		return new Promise((resolve, reject) => {

			let this_request = request(this.endpoint);

			return this_request.post('graph/'+this.account.id)
				.set('Authorization', this.test_jwt)
				.send(query)
				.expect(code)
				.expect('Content-Type', 'application/json')
				.expect('Access-Control-Allow-Origin','*')
			//.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			//.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
				.end(function(err, response){

					//du.info(response.body);

					if(err){
						du.error(err);
						return reject(err);
					}

					return resolve(response);

				});

		});

	}

}
