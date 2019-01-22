const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js')

module.exports = class IAMProvider extends AWSProvider {

	constructor(){

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.iam = new this.AWS.IAM({apiVersion: '2010-05-08'});

	}

	roleExists(parameters){
		return this.getRole(parameters).then((role) => {

			if(_.has(role, 'Role')){ return role; }

			return false;

		}).catch((error) => {

			if(_.has(error, 'code') && error.code == 'NoSuchEntity'){
				return false;
			}

			throw eu.getError('server', error);

		});

	}

	createPolicy(parameters){
		return this.iam.createPolicy(parameters).promise();

	}

	deletePolicy(parameters){
		return this.iam.deletePolicy(parameters).promise();

	}

	listEntitiesForPolicy(parameters){
		return this.iam.listEntitiesForPolicy(parameters).promise();

	}

	detachRolePolicy(parameters){
		return this.iam.detachRolePolicy(parameters).promise();

	}

	getPolicy(parameters){
		return new Promise((resolve) => {
			this.iam.getPolicy(parameters, (error, data) => {
				if(!_.isNull(error)){
					if(error.statusCode == '404'){
						return resolve(null);
					}
					throw eu.getError(error);
				}
				return resolve(data);
			});

		});

	}

	createRole(parameters){
		return this.iam.createRole(parameters).promise();

	}

	deleteRole(parameters){
		return this.iam.deleteRole(parameters).promise();

	}

	getRole(parameters){
		return this.iam.getRole(parameters).promise();

	}

	attachRolePolicy(parameters){
		return this.iam.attachRolePolicy(parameters).promise();

	}

	listAttachedRolePolicies(parameters){
		return this.iam.listAttachedRolePolicies(parameters).promise();

	}

	createInstanceProfile(parameters){
		return this.iam.createInstanceProfile(parameters).promise();

	}

	addRoleToInstanceProfile(parameters){
		return this.iam.addRoleToInstanceProfile(parameters).promise();

	}

}

