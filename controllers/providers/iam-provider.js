
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
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

		return this.iam.createPolicy(parameters).promise();

	}

	deletePolicy(parameters){

		du.debug('Delete Policy');

		return this.iam.deletePolicy(parameters).promise();

	}

	listEntitiesForPolicy(parameters){

		du.debug('List Entities For Policy');

		return this.iam.listEntitiesForPolicy(parameters).promise();

	}

	detachRolePolicy(parameters){

		du.debug('Detach Role Policy');

		return this.iam.detachRolePolicy(parameters).promise();

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

		return this.iam.createRole(parameters).promise();

	}

	deleteRole(parameters){

		du.debug('Delete Role');

		return this.iam.deleteRole(parameters).promise();

	}

	getRole(parameters){

		du.debug('Get Role');

		return this.iam.getRole(parameters).promise();

	}

	attachRolePolicy(parameters){

		du.debug('Attach Role Policy');

		return this.iam.attachRolePolicy(parameters).promise();

	}

	listAttachedRolePolicies(parameters){

		du.debug('List Attached Role Policies');

		return this.iam.listAttachedRolePolicies(parameters).promise();

	}

	createInstanceProfile(parameters){

		du.debug('Create Instance Profile');

		return this.iam.createInstanceProfile(parameters).promise();

	}

	addRoleToInstanceProfile(parameters){

		du.debug('Create Instance Profile');

		return this.iam.addRoleToInstanceProfile(parameters).promise();

	}

}

