'use strict'
var _ =  require('underscore');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert;
var fs = require('fs');
const timestamp = require('./timestamp.js');
const jwt = require('jsonwebtoken');
const util   = require('util');
const arrayutilities =  require('./array-utilities.js');
const permissionutilities =  require('./permission-utilities.js');

class TestUtilities {
	
	constructor(){
	
	}
	
	outputDiagnostics(something){
		if(_.has(process.env, 'MOCHA_VERBOSE')){
			if(process.env.MOCHA_VERBOSE == true){
				if(_.isString(something)){
					console.log("\t"+something);
				}else if(_.isObject(something)){
					console.log(util.inspect(something, {depth : null}));
				}else{
					console.log(something);
				}
			}
		}
	}
	
	//Technical Debt:  This should pull from the database that we are testing against
	getRole(role){
	
		let role_configs = [
			{
				"id":"cae614de-ce8a-40b9-8137-3d3bdff78039",
				"name": "Owner",
				"active":"true",
				"permissions":{
					"allow":[
						"*"
					]
				}
			},
			{
				"id":"e09ac44b-6cde-4572-8162-609f6f0aeca8",
				"name": "Administrator",
				"active":"true",
				"permissions":{
					"allow":[
						"accesskey/*",
						"affiliate/*",
						"campaign/*",
						"creditcard/*",
						"customer/*",
						"emailtemplate/*",
						"loadbalancer/*",
						"merchantprovider/*",
						"productschedule/*",
						"product/*",
						"rebill/*",
						"session/*",
						"shippingreceipt/*",
						"smtprovider/*",
						"transaction/*",
						"user/*"
					],
					"deny":["*"]
				}
			},
			{
				"id":"1116c054-42bb-4bf5-841e-ee0c413fa69e",
				"name": "Customer Service",
				"active":"true",
				"permissions":{
					"allow":[
						"customer/*",
						"productschedule/*",
						"product/*",
						"rebill/*",
						"session/*",
						"shippingreceipt/*",
						"transaction/*"
					],
					"deny":["*"]
				}
			}
		];
		
		let return_object = null;
		role_configs.forEach((role_config) => {
			
			if(role_config.name == role){
				return_object = role_config;
				return true;
			}
		
		});
		
		if(return_object == null){
			throw new Error('Undefined Role.');
		}
		return return_object;

	}
	
	makeGeneralizedResultName(name){
		return name.replace(/_/g,'').toLowerCase().replace(/s$/g,'');
	}
	
	getRoleAllowRules(key_name, role){
	
		let result_rules = [];

		role.permissions.allow.forEach((allow_statement) => {
			
			//has permissions for all actions across entires site
			if(allow_statement == '*'){
				result_rules.push('*');
				return true;
			}
						
			//check individual permissions	
			let allow_array = allow_statement.split('/');
			if(this.matchRoleGeneralizedName(key_name, allow_array[0])){
				result_rules.push(allow_array[1]);
			}
			
		});	
		
		return result_rules;

	}
	
	matchRoleGeneralizedName(key_name, role_entity_name){
		let g_key_name = this.makeGeneralizedResultName(key_name);
		let g_role_name = this.makeGeneralizedResultName(role_entity_name);
		return (g_key_name == g_role_name);
	}
	
	validateRoleResultsRecursive(obj, role){
		
		let skip = ['pagination'];
		let testable = [
			'accesskey',
			'account',
			'affiliate',
			'campaign',
			'creditcard',
			'customer',
			'emailtemplate',
			'fulfillmentprovider',
			'loadbalancer',
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
		
		for (var k in obj){
			
			let key_generalized_name = this.makeGeneralizedResultName(k);
			
			if(!_.contains(skip, k) && _.contains(testable, key_generalized_name)){
					
				let allow_rules = this.getRoleAllowRules(k, role);
				
				if(_.isArray(obj[k])){
					
					let all_null = true;
					obj[k].forEach((sub_object) => {
						if(!_.isNull(sub_object)){
							all_null = false;
							return;
						}
					});
					
					if(all_null !== true){
					
						if(!(_.contains(allow_rules, 'view') || _.contains(allow_rules, '*'))){
						
							this.outputDiagnostics('array fail');
							this.outputDiagnostics(key_generalized_name);
							this.outputDiagnostics(obj);
							this.outputDiagnostics(k);
							this.outputDiagnostics(obj[k]); 
							this.outputDiagnostics(allow_rules);
					
						}
						
						assert.isTrue((_.contains(allow_rules, 'view') || _.contains(allow_rules, '*')));
					
						this.validateRoleResultsRecursive(obj[k], role);
						
					}
					
				}else if(_.isObject(obj[k])){
						
					if(!(_.contains(allow_rules, 'view') || _.contains(allow_rules, '*'))){
						
						this.outputDiagnostics('object fail');
						this.outputDiagnostics(key_generalized_name);
						this.outputDiagnostics(obj);
						this.outputDiagnostics(k);
						this.outputDiagnostics(obj[k]); 
						this.outputDiagnostics(allow_rules);
					
					}
						
					assert.isTrue((_.contains(allow_rules, 'view') || _.contains(allow_rules, '*')));
					
					this.validateRoleResultsRecursive(obj[k], role);
					
				//if it is a pointer to the entity
				}else{
					
					if(_.isNull(obj[k]) || obj[k] == permissionutilities.messages.nopermission){
					
					}else{
						
						if(!((_.contains(allow_rules, 'view') || _.contains(allow_rules, '*')))){
								
								this.outputDiagnostics('string fail');
								this.outputDiagnostics(key_generalized_name);
								this.outputDiagnostics(obj);
								this.outputDiagnostics(k);
								this.outputDiagnostics(obj[k]); 
								this.outputDiagnostics(allow_rules);
							
						}
						
						assert.isTrue(((_.contains(allow_rules, 'view') || _.contains(allow_rules, '*'))));
						
					}
					
				}
				
			}
			
		}
		
	}

	assertResultSet(response, role){
	
		this.outputDiagnostics(response.body);
		
		assert.isObject(response.body.data);
		
		let hydrated_role = this.getRole(role);
		
		for(var k in response.body.data){

			this.validateRoleResultsRecursive(response.body.data[k], hydrated_role);	
			
		}
		
	}

	getQuery(filepath){
		var query = fs.readFileSync(filepath, 'utf8');
		query = query.replace(/[\r\n\t]/g,' ').replace(/\s+/g,' ');
		query = JSON.parse(query).body.trim();
		return query;
	}
	
	//why is this tied to the query?
	getAccount(filepath){
		let query_file = fs.readFileSync(filepath, 'utf8');
		query_file = query_file.replace(/[\r\n\t]/g,' ').replace(/\s+/g,' ');
		query_file = JSON.parse(query_file);
		return JSON.parse(query_file.pathParameters).account;
	}
	
	createTestTransactionJWT(){
	
		return jwt.sign({user_id:'93b086b8-6343-4271-87d6-b2a00149f070'}, global.site_config.jwt.transaction_key);
		
	}
	
	createTestAuth0JWT(user, secret_key){
	
		let jwt_contents;
		let now = timestamp.createTimestampSeconds();
		
		switch(user){
		
			case 'super.user@test.com':
				jwt_contents = {
				  "email": user,
				  "email_verified": true,
				  "iss": "https://sixcrm.auth0.com/",
				  "sub": "google-oauth2|115021313586107803846",
				  "aud": "",
				  "exp": (now+3600),
				  "iat": now
				};
				break;
			
			case 'owner.user@test.com':
				jwt_contents = {
				  "email": user,
				  "email_verified": true,
				  "picture": "",
				  "iss": "https://sixcrm.auth0.com/",
				  "sub": "",
				  "aud": "",
				  "exp": (now+3600),
				  "iat": now
				};
				break;
			
			case 'admin.user@test.com':
				jwt_contents = {
				  "email": user,
				  "email_verified": true,
				  "picture": "",
				  "iss": "https://sixcrm.auth0.com/",
				  "sub": "",
				  "aud": "",
				  "exp": (now+3600),
				  "iat": now
				};
				break;
			case 'customerservice.user@test.com':
				jwt_contents = {
				  "email": user,
				  "email_verified": true,
				  "picture": "",
				  "iss": "https://sixcrm.auth0.com/",
				  "sub": "",
				  "aud": "",
				  "exp": (now+3600),
				  "iat": now
				};
				break;
			default:
				throw new Error('Unidentified user type: '+user);
				break;
			
		}
	
		let test_jwt = jwt.sign(jwt_contents, secret_key);
		if(!jwt.verify(test_jwt, secret_key)){
			throw new Error('created invalid token');
		}
		
		return test_jwt;
        
	}
	
}

var tu =  new TestUtilities;
module.exports = tu;