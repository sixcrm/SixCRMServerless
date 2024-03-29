
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/lib/util/file-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const random = require('@6crm/sixcrmcore/lib/util/random').default;
const parserutilities = require('@6crm/sixcrmcore/lib/util/parser-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');

module.exports = class IAMDeployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.iamprovider = new IAMProvider();

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
		//Technical Debt:  Finish.
		//Need SES SMTP Users deployed automagically

		return 'Complete';

	}

	destroyUsers(){
		//Technical Debt:  Finish.
		//Need SES SMTP Users destroyed automagically

		return 'Complete';

	}

	deployPolicies(){
		return this.getPolicyDefinitionFilenames().then(policy_definition_filenames => {

			let policy_definition_file_promises = arrayutilities.map(policy_definition_filenames, policy_definition_filename => {
				let policy_definition = this.acquirePolicyFile(policy_definition_filename);

				return this.deployPolicy(policy_definition);
			});

			return Promise.all(policy_definition_file_promises).then(() => {
				return 'Complete';
			});

		});

	}

	getPolicyDefinitionFilenames(){
		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'iam/policies')).then((filenames) => { return filenames; });

	}

	acquirePolicyFile(policy_definition_filename){
		return global.SixCRM.routes.include('deployment', 'iam/policies/'+policy_definition_filename);

	}

	deployPolicy(policy_definition){
		return this.policyExists(policy_definition).then((role) => {

			if(role == false){
				return this.createPolicy(policy_definition);
			} else {
				du.info('Skip policy deployment. Policy exists.');
				return Promise.resolve();
			}
		});

	}

	policyExists(policy_definition){
		let policy_arn = parserutilities.parse(
			'arn:aws:iam::{{account}}:policy/{{policy_name}}',
			{
				account: global.SixCRM.configuration.site_config.aws.account,
				policy_name: policy_definition.PolicyName
			}
		);

		let parameters = {
			PolicyArn:policy_arn
		};

		return this.iamprovider.getPolicy(parameters).then(policy => {
			du.info(policy);
			return !(_.isNull(policy));
		});

	}

	createPolicy(policy_definition){
		let stringified_policy_document = parserutilities.parse(
			JSON.stringify(policy_definition.PolicyDocument),
			{
				aws_account_id: global.SixCRM.configuration.site_config.aws.account,
				aws_account_region: global.SixCRM.configuration.site_config.aws.region,
				logs_domain_name: global.SixCRM.configuration.site_config.elasticsearch.domain_name,
				random: random.createRandomString(10)
			}
		);

		let parameters = {
			PolicyName: policy_definition.PolicyName,
			Description: policy_definition.Description,
			PolicyDocument: stringified_policy_document
		};

		return this.iamprovider.createPolicy(parameters);

	}

	deletePolicy(policy_definition){
		let policy_arn = parserutilities.parse(
			'arn:aws:iam::{{account}}:policy/{{policy_name}}',
			{
				account: global.SixCRM.configuration.site_config.aws.account,
				policy_name: policy_definition.PolicyName
			}
		);

		let parameters = {
			PolicyArn:policy_arn
		};

		return this.removeAssociatedRoles(parameters)
			.then(() => this.iamprovider.deletePolicy(parameters));

	}

	removeAssociatedRoles(parameters){
		let parameter_clone = objectutilities.clone(parameters);

		parameter_clone.EntityFilter = 'Role';

		return this.iamprovider.listEntitiesForPolicy(parameters).then(entities => {

			if(_.has(entities, 'PolicyRoles') && arrayutilities.nonEmpty(entities.PolicyRoles)){

				let role_removal_promises = arrayutilities.map(entities.PolicyRoles, role => {

					let detach_parameters = {
						PolicyArn: parameters.PolicyArn,
						RoleName: role.RoleName
					};

					return this.iamprovider.detachRolePolicy(detach_parameters);

				});

				return Promise.all(role_removal_promises).then(() => {

					return true;

				});

			}

			return true;
		});

	}

	async deployRoles(){
		let role_file_names = await this.getRoleDefinitionFilenames();

		let deploy_role_file_promises = arrayutilities.map(role_file_names, (role_file_name) => {

			return () => this.deployRoleFile(role_file_name);

		});

		await arrayutilities.serial(deploy_role_file_promises);

		return 'Complete';

	}

	async deployRoleFile(role_file_name){
		let role_definitions = this.acquireRoleFile(role_file_name);

		let deploy_role_promises = arrayutilities.map(role_definitions, (role_definition) => {
			return () => this.deployRole(role_definition);
		});

		let result = await arrayutilities.serial(deploy_role_promises);

		return result;

	}

	getRoleDefinitionFilenames(){
		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('deployment', 'iam/roles')).then((filenames) => { return filenames; });

	}

	acquireRoleFile(filename){
		return global.SixCRM.routes.include('deployment', 'iam/roles/'+filename);

	}

	deployRole(role_definition){
		return this.roleExists(role_definition).then((role) => {

			if(role == false){
				return this.createRole(role_definition);
			} else {
				du.info('Skip role deployment. Role exists:', role_definition);
				return Promise.resolve();
			}

		});

	}

	roleExists(role_definition){
		let exists_parameters = this.transformDefinition('role', 'exists', role_definition);

		return this.iamprovider.roleExists(exists_parameters);

	}

	async updateRole(role_definition){
		await this.removePoliciesAndPermissions(role_definition);
		await this.addPoliciesAndPermissions(role_definition);

		return true;

	}

	createRole(role_definition){
		let create_parameters = this.transformDefinition('role', 'create', role_definition);

		if(!_.isString(create_parameters, 'AssumeRolePolicyDocument') && _.isObject(create_parameters.AssumeRolePolicyDocument)){
			create_parameters.AssumeRolePolicyDocument =  JSON.stringify(create_parameters.AssumeRolePolicyDocument);
		}

		create_parameters.AssumeRolePolicyDocument = parserutilities.parse(create_parameters.AssumeRolePolicyDocument, {aws_account_id: global.SixCRM.configuration.site_config.aws.account});

		return this.iamprovider.createRole(create_parameters).then(() => {

			return timestamp.delay(3000)().then(() => this.addPoliciesAndPermissions(role_definition));

		});

	}

	removePoliciesAndPermissions(role_definition){
		let list_attached_role_policies_parameters = this.transformDefinition('role', 'list_attached', role_definition);

		return this.iamprovider.listAttachedRolePolicies(list_attached_role_policies_parameters).then((role_policies) => {

			if(_.has(role_policies, 'AttachedPolicies')){

				let remove_role_policy_promises = arrayutilities.map(role_policies.AttachedPolicies, (attached_policy) => {

					let detach_parameters = {RoleName: role_definition.RoleName, PolicyArn: attached_policy.PolicyArn};

					return this.iamprovider.detachRolePolicy(detach_parameters);

				});

				return Promise.all(remove_role_policy_promises).then(() => {

					du.info('Role policies removed.');
					return true;

				});

			}

			du.info('Role doesn\'t have attached policies');
			return false;

		});

	}

	addPoliciesAndPermissions(role_definition){
		if(_.has(role_definition, 'ManagedPolicies')){

			let role_name = role_definition.RoleName;

			let policy_promises = arrayutilities.map(role_definition.ManagedPolicies, (policy_arn) => {

				policy_arn = parserutilities.parse(policy_arn, {account: global.SixCRM.configuration.site_config.aws.account});

				return this.iamprovider.attachRolePolicy({
					RoleName: role_name,
					PolicyArn: policy_arn
				});

			});

			return Promise.all(policy_promises).then(() => {
				du.info('Managed policies associated.');
				return true;
			});

		}

		du.info('No managed policies');

		return Promise.resolve(true);

	}

	transformDefinition(type, action, role_definition){
		return this.createParameterGroup(type, action, role_definition);

	}

	destroyRoles(){
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
		return this.roleExists(role_definition).then((role) => {

			if(role == false){
				du.info('Role doesn\'t exist, continuing');
				return true;
			}else{
				return this.removePoliciesAndPermissions(role_definition)
					.then(() => this.deleteRole(role_definition))
					.then((result) => {
						du.info('Role deleted');
						return result;
					});
			}

		});

	}

	deleteRole(role_definition){
		let delete_parameters = this.transformDefinition('role', 'delete', role_definition);

		return this.iamprovider.deleteRole(delete_parameters);

	}

	//Technical Debt: need place intance profile settings into a config file
	deployInstanceProfiles(){
		let parameters = {
			InstanceProfileName : 'DataPipelineDefaultResourceRole'
		}

		return this.iamprovider.createInstanceProfile(parameters)
			.then(() => {

				parameters.RoleName = 'DataPipelineDefaultResourceRole'

				return this.iamprovider.addRoleToInstanceProfile(parameters);
			});

	}

}
