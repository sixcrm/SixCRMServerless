'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js')

class IAMUtilities extends AWSUtilities {

    constructor(){

      super();

      this.iam = new AWS.IAM({apiVersion: '2010-05-08'});

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

        eu.throwError('server', error);

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

    detachRolePolicy(parameters){

      du.debug('Detach Role Policy');

      return new Promise((resolve) => {

        this.iam.detachRolePolicy(parameters, (error, data) => resolve(this.AWSCallback(error, data)));

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

module.exports = new IAMUtilities();
