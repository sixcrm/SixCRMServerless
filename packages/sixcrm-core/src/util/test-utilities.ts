import * as _ from 'lodash';
import * as chai from 'chai';
const assert = chai.assert;
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';

import timestamp from './timestamp';
import du from './debug-utilities';
import eu from './error-utilities';

import * as chaijson from 'chai-json-schema';
chai.use(chaijson);

export class TestUtilities {

	skip: string[];
	testable: string[];

	constructor() {
		this.skip = ['pagination'];
		this.testable = [
			'accesskey',
			'account',
			'affiliate',
			'bill',
			'campaign',
			'creditcard',
			'customer',
			'customernote',
			'emailtemplate',
			'fulfillmentprovider',
			'merchantprovidergroup',
			'merchantprovider',
			'product',
			'productschedule',
			'rebill',
			'role',
			'session',
			'shippingreceipt',
			'smtpprovider',
			'transaction',
			'user'
		];

	}

	// Technical Debt:  This should pull from the database that we are testing against
	getRole(role) {

		du.debug('Get Role');

		const role_configs = [{
			id: "cae614de-ce8a-40b9-8137-3d3bdff78039",
			name: "Owner",
			active: true,
			permissions: {
				allow: [
					"*"
				]
			}
		},
		{
			id: "e09ac44b-6cde-4572-8162-609f6f0aeca8",
			name: "Administrator",
			active: true,
			permissions: {
				allow: [
					"analytics/*",
					"accesskey/*",
					"affiliate/*",
					"account/*",
					"bill/*",
					"campaign/*",
					"creditcard/*",
					"customer/*",
					"customernote/*",
					"emailtemplate/*",
					"invite/*",
					"merchantprovidergroup/*",
					"merchantprovidergroupassociation/*",
					"merchantprovider/*",
					"productschedule/*",
					"product/*",
					"rebill/*",
					"return/*",
					"role/read",
					"session/*",
					"shippingreceipt/*",
					"smtpprovider/*",
					"transaction/*",
					"notification/*",
					"notificationread/*",
					"notificationsetting/*",
					"user/*",
					"useracl/*",
					"usersetting/*",
					"usersigningstring/*",
					"userdevicetoken/*",
					"tracker/*",
					"register/*",
					"fulfillmentprovider/*"
				],
				deny: ["*"]
			}
		},
		{
			id: "1116c054-42bb-4bf5-841e-ee0c413fa69e",
			name: "Customer Service",
			active: true,
			permissions: {
				allow: [
					"accesskey/read",
					"campaign/read",
					"customer/*",
					"customernote/*",
					"creditcard/read",
					"creditcard/create",
					"creditcard/update",
					"customer/*",
					"productschedule/*",
					"product/*",
					"role/read",
					"rebill/*",
					"return/*",
					"session/*",
					"shippingreceipt/*",
					"transaction/*",
					"role/read",
					"notification/*",
					"notificationread/*",
					"notificationsetting/*",
					"user/read",
					"account/read",
					"usersetting/*",
					"usersigningstring/*",
					"userdevicetoken/*",
					"register/*"
				],
				deny: ["*"]
			}
		}
		];

		const return_object = _.find(role_configs, (role_config) => role_config.name === role);
		if (return_object == null) {
			throw eu.getError('not_found', 'Undefined Role.');
		}

		return return_object;

	}

	makeGeneralizedResultName(name) {

		du.debug('Make Generalized Result Name');

		return name.replace(/_/g, '').toLowerCase().replace(/s$/g, '');
	}

	getRoleAllowRules(key_name, role) {

		du.debug('Get Role Allow Rules');

		const result_rules: string[] = [];

		role.permissions.allow.forEach((allow_statement) => {

			// has permissions for all actions across entires site
			if (allow_statement === '*') {
				result_rules.push('*');
				return;
			}

			// check individual permissions
			const allow_array = allow_statement.split('/');

			if (this.matchRoleGeneralizedName(key_name, allow_array[0])) {
				result_rules.push(allow_array[1]);
			}

		});

		if (key_name === 'roles' && !_.includes(result_rules, 'read')) {
			result_rules.push('read');
		}

		return result_rules;

	}

	matchRoleGeneralizedName(key_name, role_entity_name) {

		du.debug('Match Role Generalized Name');

		const g_key_name = this.makeGeneralizedResultName(key_name);
		const g_role_name = this.makeGeneralizedResultName(role_entity_name);

		return (g_key_name === g_role_name);
	}

	validateRoleResultsRecursive(obj, role) {

		du.debug('Validate Role Results Recursive');

		// Technical Debt: does this work for arrays?
		for (const k in obj) {

			const key_generalized_name = this.makeGeneralizedResultName(k);

			du.debug('Generalized Name: ', key_generalized_name);

			if (!_.includes(this.skip, k) && _.includes(this.testable, key_generalized_name)) {

				const allow_rules = this.getRoleAllowRules(k, role);

				du.debug('Pre-false Positive', k, obj[k], role);

				this.hasFalsePositive(obj[k], allow_rules);

				if (_.isObject(obj[k])) {

					this.validateRoleResultsRecursive(obj[k], role);

				}

			}

		}

	}

	hasFalseNegative() {

		du.debug('Has False Negative');

	}

	hasFalsePositive(object, allow_rules) {

		du.debug('Has False Positive');

		du.debug('Object:', object, 'Allow Rules:', allow_rules);

		// it's an array with value-things
		if (_.isArray(object)) {

			let all_null = true;

			object.forEach((sub_object) => {
				if (!_.isNull(sub_object)) {
					all_null = false;
					return;
				}
			});

			if (all_null !== true) {

				if (!(_.includes(allow_rules, 'read') || _.includes(allow_rules, '*'))) {

					du.debug('array fail');

				}

				assert.isTrue((_.includes(allow_rules, 'read') || _.includes(allow_rules, '*')), 'Has no read or * in allow rules.');

			}

			// it's a object with keys: value-things
		} else if (_.isObject(object)) {

			if (!(_.includes(allow_rules, 'read') || !_.includes(allow_rules, '*'))) {

				du.debug('object fail');

			}

			assert.isTrue((_.includes(allow_rules, 'read') || _.includes(allow_rules, '*')), 'Has no read or * in allow rules.');

			// if it is a pointer to the entity
		} else {

			if (_.isNull(object) || object === false || _.isUndefined(object)) {

				du.debug('Null object or no permission');

			} else {

				if (!((_.includes(allow_rules, 'read') || _.includes(allow_rules, '*')))) {

					du.debug('string fail');

				}

				assert.isTrue(((_.includes(allow_rules, 'read') || _.includes(allow_rules, '*'))), 'Has no read or * in allow rules.');

			}

		}

	}

	assertResultSet(response, role, operation) {

		du.debug('Assert Result Set');

		if (response.body.response) {

			assert.isObject(response.body.response, JSON.stringify(response.body));

			const hydrated_role = this.getRole(role);

			du.debug('Hydrated Role:', hydrated_role);

			for (const k in response.body.response) {

				this.validateRoleResultsRecursive(response.body.response[k], hydrated_role);

			}

			assert.equal(response.body.code, 200, response.body);

			if (operation) {

				const path_to_schema = global.SixCRM.routes.path('model', `endpoints/graph/responses/entities/operations/${operation}.json`);

				if (fs.existsSync(path_to_schema)) {
					assert.isTrue(tu.validateGraphResponse(response.body, `entities/operations/${operation}`), `Response is not valid ` + response.body);
				} else {
					du.warning(`Can't validate response. Schema not found at ${path_to_schema}`);
				}

			}

		} else {
			const error_category_400_regex = /4\d{2}/;

			assert.isTrue(error_category_400_regex.test(response.body.code), `Response code '${response.body.code}' is not of type 4xx. Response body: '${JSON.stringify(response.body)}'`);
		}

	}

	assertResultSetAsync(response, role, operation, done) {
		try {
			this.assertResultSet(response, role, operation);
			done();
		} catch (e) {
			du.warning('Test fail, retry.');
			done(e);
		}
	}

	getQuery(filepath) {
		return require(filepath).body;
	}

	getSearchParameters(filepath) {

		du.debug('Get Search Parameters');

		let event = fs.readFileSync(filepath, 'utf8');

		event = event.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ');
		event = JSON.parse(event).body.trim();
		return event;
	}

	// Technical Debt: why is this tied to the query?
	getAccount(filepath) {

		du.debug('Get Account');

		return require(filepath).pathParameters.account;
	}

	createTestCustomerJWT(id = '24f7c851-29d4-4af9-87c5-0298fa74c689') {

		du.debug('Create Test Customer JWT');

		const now = timestamp.createTimestampSeconds();

		const body = {
			customer: id,
			iss: global.SixCRM.configuration.getBase(),
			sub: "",
			aud: "",
			exp: (now + 3600),
			iat: now
		};

		return this.generateJWT(body, global.SixCRM.configuration.site_config.jwt.customer.secret_key);

	}

	createTestTransactionJWT() {

		du.debug('Create Test Transaction JWT');

		return jwt.sign({
			user_id: '93b086b8-6343-4271-87d6-b2a00149f070'
		}, global.SixCRM.configuration.site_config.jwt.transaction.secret_key);

	}

	generateJWT(body, secret) {

		du.debug('Generate JWT');

		const test_jwt = jwt.sign(body, secret);

		if (!jwt.verify(test_jwt, secret)) {
			throw eu.getError('server', 'created invalid token');
		}

		return test_jwt;

	}

	createTestAuth0JWT(user, secret_key) {

		du.debug('Create Test Auth0 JWT');

		let jwt_contents;
		const now = timestamp.createTimestampSeconds();

		switch (user) {

			case 'super.user@test.com':
				jwt_contents = {
					email: user,
					email_verified: true,
					iss: "https://sixcrm.auth0.com/",
					sub: "google-oauth2|115021313586107803836",
					aud: "",
					exp: (now + 3600),
					iat: now
				};
				break;

			case 'owner.user@test.com':
				jwt_contents = {
					email: user,
					email_verified: true,
					picture: "",
					iss: "https://sixcrm.auth0.com/",
					sub: "",
					aud: "",
					exp: (now + 3600),
					iat: now
				};
				break;

			case 'admin.user@test.com':
				jwt_contents = {
					email: user,
					email_verified: true,
					picture: "",
					iss: "https://sixcrm.auth0.com/",
					sub: "",
					aud: "",
					exp: (now + 3600),
					iat: now
				};
				break;
			case 'customerservice.user@test.com':
				jwt_contents = {
					email: user,
					email_verified: true,
					picture: "",
					iss: "https://sixcrm.auth0.com/",
					sub: "",
					aud: "",
					exp: (now + 3600),
					iat: now
				};
				break;

			case 'unknown.user@test.com':
				jwt_contents = {
					email: user,
					email_verified: false,
					iss: "https://sixcrm.auth0.com/",
					sub: "1238109231",
					aud: "",
					exp: (now + 3600),
					iat: now
				};
				break;

			default:

				throw eu.getError('server', 'Unidentified user type: ' + user);

		}

		return this.generateJWT(jwt_contents, secret_key);

	}

	validateGraphResponse(response, graph_model_name) {

		const path_to_schema = global.SixCRM.routes.path('model', `endpoints/graph/responses/${graph_model_name}.json`);

		return global.SixCRM.validate(response, path_to_schema);

	}

	assertSuccessfulResponse(response, graph_model_name) {

		this.validateGraphResponse(response, graph_model_name);

		assert.equal(response.success, true, JSON.stringify(response));
		assert.equal(response.code, 200, JSON.stringify(response));
	}

	assertUnsuccessfulResponse(response) {

		assert.equal(response.success, false, JSON.stringify(response));
		assert.notEqual(response.code, 200, JSON.stringify(response));
	}

}

const tu = new TestUtilities();
export default tu;
