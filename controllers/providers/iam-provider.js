
const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js')

module.exports = class IAMProvider extends AWSProvider {

	constructor(){

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.iam = new this.AWS.IAM({apiVersion: '2010-05-08'});

	}

	roleExists(parameters){

		du.debug('Role Exists');

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

		du.debug('Create Policy');

		return new Promise((resolve) => {
			this.iam.createPolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));
		});

	}

	deletePolicy(parameters){

		du.debug('Delete Policy');

		return new Promise((resolve) => {

			this.iam.deletePolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	listEntitiesForPolicy(parameters){

		du.debug('List Entities For Policy');

		return new Promise((resolve) => {

			this.iam.listEntitiesForPolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	detachRolePolicy(parameters){

		du.debug('Detach Role Policy');

		return new Promise((resolve) => {

			this.iam.detachRolePolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	getPolicy(parameters){

		du.debug('Get Policy');

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

		du.debug('Create Role');

		return new Promise((resolve) => {

			this.iam.createRole(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	deleteRole(parameters){

		du.debug('Delete Role');

		return new Promise((resolve) => {

			this.iam.deleteRole(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	getRole(parameters){

		du.debug('Get Role');

		return new Promise((resolve, reject) => {

			this.iam.getRole(parameters, (error, data) => {
				if(error){
					return reject(error);
				}
				return resolve(data);
			});

		});

	}

	attachRolePolicy(parameters){

		du.debug('Attach Role Policy');

		return new Promise((resolve) => {

			this.iam.attachRolePolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	listAttachedRolePolicies(parameters){

		du.debug('List Attached Role Policies');

		return new Promise((resolve) => {

			this.iam.listAttachedRolePolicies(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	createInstanceProfile(parameters){

		du.debug('Create Instance Profile');

		return new Promise((resolve) => {

			return this.iam.createInstanceProfile(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

	addRoleToInstanceProfile(parameters){

		du.debug('Create Instance Profile');

		return new Promise((resolve) => {

			return this.iam.addRoleToInstanceProfile(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

		});

	}

}

