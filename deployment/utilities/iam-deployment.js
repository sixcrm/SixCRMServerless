'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

class IAMDeployment extends AWSDeploymentUtilities {

    constructor() {

      super();

      this.iamutilities =  global.SixCRM.routes.include('lib', 'iam-utilities.js');

      this.parameter_groups = {
        role: {
          create: {
            required:['AssumeRolePolicyDocument','RoleName'],
            optional:['Description', 'Path']
          },
          exists: {
            required:['RoleName']
          },
          delete: {
            required:['RoleName']
          },
          list_attached:{
            required:['RoleName'],
            optional:['Marker', 'MaxItems','PathPrefix']
          }
        }
      }

    }

    deployUsers(){

      du.debug('Deploy Users');

      //Technical Debt:  Finish.
      //Need SES SMTP Users deployed automagically

      return 'Complete';

    }

    destroyUsers(){

      du.debug('Deploy Users');

      //Technical Debt:  Finish.
      //Need SES SMTP Users destroyed automagically

      return 'Complete';

    }

    deployRoles(){

      du.debug('Deploy Roles');

      return this.getRoleDefinitionFilenames().then((role_file_names) => {

        let deploy_role_file_promises = arrayutilities.map(role_file_names, (role_file_name) => {

          let role_definitions = this.acquireRoleFile(role_file_name);

          let deploy_role_promises = arrayutilities.map(role_definitions, (role_definition) => {
            return this.deployRole(role_definition);
          });

          return Promise.all(deploy_role_promises);

        });

        return Promise.all(deploy_role_file_promises).then(() => {
          return 'Complete';
        });

      });

    }

    getRoleDefinitionFilenames(){

      du.debug('Get Role Definition Filenames');

      return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'iam/roles')).then((filenames) => { return filenames; });

    }

    acquireRoleFile(filename){

      du.debug('Acquire Role File');

      return global.SixCRM.routes.include('deployment', 'iam/roles/'+filename);

    }

    deployRole(role_definition){

      du.debug('Deploy Roles');

      return this.roleExists(role_definition).then((role) => {

        if(role == false){
          return this.createRole(role_definition);
        }else{
          return this.updateRole(role_definition);
        }
      });

    }

    roleExists(role_definition){

      du.debug('Role Exists');

      let exists_parameters = this.transformDefinition('role', 'exists', role_definition);

      return this.iamutilities.roleExists(exists_parameters);

    }

    updateRole(role_definition){

      du.debug('Update Role');

      return this.removePoliciesAndPermissions(role_definition).then(this.addPoliciesAndPermissions(role_definition));

    }

    createRole(role_definition){

      du.debug('Create Role');

      let create_parameters = this.transformDefinition('role', 'create', role_definition);

      if(!_.isString(create_parameters, 'AssumeRolePolicyDocument') && _.isObject(create_parameters.AssumeRolePolicyDocument)){
        create_parameters.AssumeRolePolicyDocument =  JSON.stringify(create_parameters.AssumeRolePolicyDocument);
      }

      create_parameters.AssumeRolePolicyDocument = parserutilities.parse(create_parameters.AssumeRolePolicyDocument, {aws_account_id: global.SixCRM.configuration.site_config.aws.account});

      return this.iamutilities.createRole(create_parameters).then((result) => {

        return timestamp.delay(3000)().then(() => this.addPoliciesAndPermissions(role_definition));

      });

    }

    removePoliciesAndPermissions(role_definition){

      du.debug('Remove Policies And Permissions');

      let list_attached_role_policies_parameters = this.transformDefinition('role', 'list_attached', role_definition);

      return this.iamutilities.listAttachedRolePolicies(list_attached_role_policies_parameters).then((role_policies) => {

        if(_.has(role_policies, 'AttachedPolicies')){

          let remove_role_policy_promises = arrayutilities.map(role_policies.AttachedPolicies, (attached_policy) => {

            let detach_parameters = {RoleName: role_definition.RoleName, PolicyArn: attached_policy.PolicyArn};

            return this.iamutilities.detachRolePolicy(detach_parameters);

          });

          return Promise.all(remove_role_policy_promises).then(() => {

            du.highlight('Role policies removed.');
            return true;

          });

        }

        du.highlight('Role doesn\'t have attached policies');
        return false;

      });

    }

    addPoliciesAndPermissions(role_definition){

      du.debug('Add Policies And Permissions');

      if(_.has(role_definition, 'ManagedPolicies')){

        let role_name = role_definition.RoleName;

        let policy_promises = arrayutilities.map(role_definition.ManagedPolicies, (policy_arn) => {

          return this.iamutilities.attachRolePolicy({
            RoleName: role_name,
            PolicyArn: policy_arn
          });

        });

        return Promise.all(policy_promises).then(() => {
          du.highlight('Managed policies associated.');
          return true;
        });

      }

      du.info('No managed policies');

      return Promise.resolve(true);

    }

    transformDefinition(type, action, role_definition){

      du.debug('Tranform Definition');

      return this.createParameterGroup(type, action, role_definition);

    }

    destroyRoles(){

      du.debug('Destroy Roles');

      return this.getRoleDefinitionFilenames().then((role_file_names) => {

        let deploy_role_file_promises = arrayutilities.map(role_file_names, (role_file_name) => {

          let role_definitions = this.acquireRoleFile(role_file_name);

          let deploy_role_promises = arrayutilities.map(role_definitions, (role_definition) => {

						//Technical Debt: this can be way cleaner, can remove role from instance profile then delete
						if(!role_definition.RoleName === 'DataPipelineDefaultResourceRole'){
							return this.destroyRole(role_definition);
						}

          });

          return Promise.all(deploy_role_promises);

        });

        return Promise.all(deploy_role_file_promises).then(() => {
          return 'Complete';
        });

      });

    }

    destroyRole(role_definition){

      du.debug('Destroy Role');

      return this.roleExists(role_definition).then((role) => {

        if(role == false){
          du.highlight('Role doesn\'t exist, continuing');
          return true;
        }else{
          return this.removePoliciesAndPermissions(role_definition)
          .then(() => this.deleteRole(role_definition))
          .then((result) => {
            du.highlight('Role deleted');
            return result;
          });
        }

      });

    }

    deleteRole(role_definition){

      du.debug('Delete Role');

      let delete_parameters = this.transformDefinition('role', 'delete', role_definition);

      return this.iamutilities.deleteRole(delete_parameters);

		}

		//Technical Debt: need place intance profile settings into a config file
		deployInstanceProfiles(){

			du.debug('Deploy Instance Profile');

			let parameters = {
				InstanceProfileName : 'DataPipelineDefaultResourceRole'
			}

			return this.iamutilities.createInstanceProfile(parameters)
				.then(() => {

					parameters.RoleName = 'DataPipelineDefaultResourceRole'

					return this.iamutilities.addRoleToInstanceProfile(parameters);
				});

		}

}

module.exports = new IAMDeployment();
