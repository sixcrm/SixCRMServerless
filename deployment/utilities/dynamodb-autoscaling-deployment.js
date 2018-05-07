

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const AutoscalingProvider = global.SixCRM.routes.include('controllers', 'providers/autoscaling-provider.js');
const DynamoDBProvider = global.SixCRM.routes.include('controllers', 'providers/dynamodb-provider.js');
const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');

module.exports = class DynamoDBAutoscalingDeployment extends AWSDeploymentUtilities {

	constructor(){

		super();

		this.parameter_validation = {
			'autoscalingrole':global.SixCRM.routes.path('model', 'deployment/dynamodb/autoscaling/role.json'),
			'tablenames':global.SixCRM.routes.path('model', 'deployment/dynamodb/autoscaling/tablenames.json'),
			'tablename':global.SixCRM.routes.path('model','deployment/dynamodb/autoscaling/tablename.json'),
			'tabledescription':global.SixCRM.routes.path('model','deployment/dynamodb/autoscaling/tabledescription.json'),
			'autoscalingconfigurations':global.SixCRM.routes.path('model','deployment/dynamodb/autoscaling/autoscalingconfigurations.json'),
			'autoscalingconfiguration':global.SixCRM.routes.path('model','deployment/dynamodb/autoscaling/autoscalingconfiguration.json'),
			'scalabletargetconfigurations': global.SixCRM.routes.path('model','deployment/dynamodb/autoscaling/scalabletargetconfigurations.json'),
			'scalingpolicyconfigurations': global.SixCRM.routes.path('model','deployment/dynamodb/autoscaling/scalingpolicyconfigurations.json'),
		};

		this.parameter_definition = {
			autoscaleTable:{
				required:{
					tablename:'table_name'
				},
				optional:{}
			}
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition})

		this.dynamodbprovider = new DynamoDBProvider();
		this.iamprovider = new IAMProvider();
		this.autoscalingprovider = new AutoscalingProvider();

	}

	autoscaleTables(){

		du.debug('Autoscale Tables');

		return this.getAutoscalingRole()
			.then(() => this.getTableDefinitionFilenames())
			.then(() => this.setAutoscalingForTables());

	}

	getAutoscalingRole(){

		du.debug('Get Autoscaling Role');

		let role_definition = global.SixCRM.routes.include('deployment', 'dynamodb/configuration/autoscalingrole.json');

		return this.iamprovider.roleExists(role_definition).then(result => {

			if(result == false){
				throw eu.getError('server', 'Role does not exist: '+role_definition.RoleName);
			}

			this.parameters.set('autoscalingrole', result);

			return true;

		});

	}

	getTableDefinitionFilenames(){

		du.debug('Get Table Definition Filenames');

		let directory_path = global.SixCRM.routes.path('tabledefinitions');

		return fileutilities.getDirectoryFiles(directory_path).then(directory_file_paths => {

			let table_names = arrayutilities.map(directory_file_paths, directory_file_path => {

				let table_definition = global.SixCRM.routes.include('tabledefinitions', directory_file_path);

				if(!objectutilities.hasRecursive(table_definition, 'Table.TableName')){
					throw eu.getError('server', 'Bad table configuration: '+global.SixCRM.routes.path('tabledefinitions', directory_file_path));
				}

				return table_definition.Table.TableName;

			});

			return this.parameters.set('tablenames', table_names);

		});

	}

	setAutoscalingForTables(){

		du.debug('Set Autoscaling For Tables');

		let tablenames = this.parameters.get('tablenames');

		let table_autoscaling_promises = arrayutilities.map(tablenames, (table_name) => {
			return () => this.autoscaleTable({table_name: table_name});
		});

		return arrayutilities.serial(
			table_autoscaling_promises
		).then(() => {
			return 'Complete';
		});

	}

	autoscaleTable({table_name}){

		du.debug('Autoscale Table');

		du.info('#####','','Setting Autoscaling for table: '+table_name,'','#####');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'autoscaleTable'}))
			.then(() => this.setTableDescription())
			.then(() => this.acquireAutoscalingConfigurations())
			.then(() => this.executeAutoscalingConfigurations())
			.then(() => this.describeTableAutoscaling())
			.then(() => {
				du.warning('Pausing for 5000 ms...');
				return timestamp.delay(5000, true)();
			})
			.catch((error) => {
				du.error(error);
				let table_name = this.parameters.get('tablename');

				du.info('Skipping table: '+table_name);
			})
			.then(() => this.cleanup());

	}

	setTableDescription(){

		du.debug('Set Table Description');

		let table_name = this.parameters.get('tablename');

		let table_definition = global.SixCRM.routes.include('tabledefinitions', table_name+'.json');

		return this.tableExists(table_definition.Table.TableName).then((table_description) => {

			if(table_description == false){

				du.error('Table does not exist: '+table_definition.Table.TableName);
				du.info('Skipping...');

				return Promise.reject();

			}

			this.parameters.set('tabledescription', table_description);

			return true;

		});

	}

	acquireAutoscalingConfigurations(){

		du.debug('Acquire Table Autoscaling Configurations');

		let table_name = this.parameters.get('tablename');

		if(fileutilities.fileExists(global.SixCRM.routes.path('deployment', 'dynamodb/configuration/autoscaling/'+table_name+'.json'))){

			let autoscaling_configurations = global.SixCRM.routes.include('deployment', 'dynamodb/configuration/autoscaling/'+table_name+'.json');

			this.parameters.set('autoscalingconfigurations', autoscaling_configurations);

		}else{

			return Promise.reject('No autoscaling configuration exists for table '+table_name);

		}

		return true;

	}

	executeAutoscalingConfigurations(){

		du.debug('Execute Autoscaling Configurations');

		let autoscaling_configurations = this.parameters.get('autoscalingconfigurations');

		let configuration_executions = arrayutilities.map(autoscaling_configurations, autoscaling_configuration => {
			return () => this.executeAutoscalingConfiguration({autoscaling_configuration: autoscaling_configuration});
		});

		return arrayutilities.serial(configuration_executions)
			.then(() => {
				return 'Complete';
			});

	}

	executeAutoscalingConfiguration({autoscaling_configuration}){

		du.debug('Execute Autoscaling Configuration');

		this.parameters.set('autoscalingconfiguration', autoscaling_configuration);

		return Promise.resolve()
			.then(() => this.setTableScalableTargetConfigurations())
			.then(() => this.setTableScalableTargets())
			.then(() => this.setTableScalingPolicyConfigurations())
			.then(() => this.setTableScalingPolicies())
			.catch((error) => { du.error(error); })
			.then(() => {
				return this.parameters.unset('autoscalingconfiguration');
			});

	}

	setTableScalableTargetConfigurations(){

		du.debug('Set Table Scalable Targets');

		let autoscaling_role = this.parameters.get('autoscalingrole');
		let autoscaling_configuration = this.parameters.get('autoscalingconfiguration');

		let immutable_parameters = {
			ResourceId: this.parseTableName(autoscaling_configuration.ResourceId),
			RoleARN: autoscaling_role.Role.Arn
		};

		let scalable_target_configurations = arrayutilities.map(autoscaling_configuration.scalable_targets, scalable_target => {
			return objectutilities.merge(immutable_parameters, scalable_target);
		});

		this.parameters.set('scalabletargetconfigurations', scalable_target_configurations);

		return true;

	}

	setTableScalableTargets(){

		du.debug('Set Table Scalable Targets');

		let scalable_target_configurations = this.parameters.get('scalabletargetconfigurations');

		let scalable_target_configuration_promises = arrayutilities.map(scalable_target_configurations, scalable_target_configuration => {
			return this.autoscalingprovider.registerScalableTarget(scalable_target_configuration);
		});

		return Promise.all(scalable_target_configuration_promises).then(() => {
			du.info('Successfully set scalable targets for table');
			return true;
		});

	}

	setTableScalingPolicyConfigurations(){

		du.debug('Set Table Scaling Policy Configurations');

		let autoscaling_configuration = this.parameters.get('autoscalingconfiguration');

		let scaling_policy_configurations = arrayutilities.map(autoscaling_configuration.scaling_policies, scaling_policy => {

			let immutable_parameters = {
				ResourceId: this.parseTableName(autoscaling_configuration.ResourceId),
				PolicyName: this.createScalingPolicyName(scaling_policy)
			};

			return objectutilities.merge(immutable_parameters, scaling_policy);

		});

		this.parameters.set('scalingpolicyconfigurations', scaling_policy_configurations);

		return true;

	}

	setTableScalingPolicies(){

		du.debug('Set Table Scaling Policies');

		let scaling_policy_configurations = this.parameters.get('scalingpolicyconfigurations');

		let scaling_policy_configuration_promises = arrayutilities.map(scaling_policy_configurations, scaling_policy_configuration => {
			return this.autoscalingprovider.putScalingPolicy(scaling_policy_configuration);
		});

		return Promise.all(scaling_policy_configuration_promises).then(() => {
			du.info('Successfully put scaling policies for table');
			return true;
		});

	}

	createScalingPolicyName(scaling_policy){

		du.debug('Create Scaling Policy Name');

		let autoscaling_configuration = this.parameters.get('autoscalingconfiguration');

		let pre_hash = this.parseTableName(autoscaling_configuration.ResourceId)+'_'+scaling_policy.ScalableDimension;

		return stringutilities.removeNonAlphaNumeric(pre_hash);

	}

	cleanup(){

		du.debug('Cleanup');

		this.parameters.unset('tablename');
		this.parameters.unset('tabledescription');
		this.parameters.unset('autoscalingconfiguration');
		this.parameters.unset('scalabletargetconfigurations');
		this.parameters.unset('scalingpolicyconfigurations');

	}

	describeTableAutoscaling(){

		du.debug('Describe Table Autoscaling');

		let table_name = this.parameters.get('tablename');
		let autoscaling_configurations = this.parameters.get('autoscalingconfigurations');

		let resource_ids = arrayutilities.map(autoscaling_configurations, autoscaling_configuration => {
			return this.parseTableName(autoscaling_configuration.ResourceId);
		});

		let parameters = {
			ServiceNamespace:'dynamodb',
			ResourceIds:resource_ids
		}

		return this.autoscalingprovider.describeScalableTargets(parameters)
			.then(result => {

				du.info(table_name+' scaling targets');
				du.info(result);
				return true;

			})
			.then(() => {

				let scaling_policies_promises = arrayutilities.map(resource_ids, resource_id => {

					let parameters = {
						ResourceId: resource_id,
						ServiceNamespace:'dynamodb'
					};

					return () => this.autoscalingprovider.describeScalingPolicies(parameters)
						.then(result => {

							du.info(resource_id+' Scaling Policies:');
							du.info(result);
							return true;

						});

				});

				return arrayutilities.serial(scaling_policies_promises).then(() => {return true;});

			})

	}

	tableExists(table_name){

		du.debug('Table Exists');

		return this.dynamodbprovider.describeTable(table_name, false).then((results) => {

			du.info('Table found: '+table_name);
			return results;

		}).catch(() => {

			du.info('Unable to find table '+table_name);
			return false;

		});

	}

	parseTableName(some_string){

		du.debug('Parse Table Name');

		let table_name = this.parameters.get('tablename');

		return some_string.replace('{tablename}', table_name);

	}

}
