
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
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

	autoscaleTables(table = null){
		return this.getAutoscalingRole()
			.then(() => this.getTableDefinitionFilenames())
			.then(() => this.setAutoscalingForTables(table));

	}

	getAutoscalingRole(){
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

	setAutoscalingForTables(table = null){
		let tablenames;

		if(!_.isNull(table)){
			tablenames = [table];
		}else{
			tablenames = this.parameters.get('tablenames');
		}

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
		let autoscaling_configuration = this.parameters.get('autoscalingconfiguration');

		let pre_hash = this.parseTableName(autoscaling_configuration.ResourceId)+'_'+scaling_policy.ScalableDimension;

		return stringutilities.removeNonAlphaNumeric(pre_hash);

	}

	cleanup(){
		this.parameters.unset('tablename');
		this.parameters.unset('tabledescription');
		this.parameters.unset('autoscalingconfiguration');
		this.parameters.unset('scalabletargetconfigurations');
		this.parameters.unset('scalingpolicyconfigurations');

	}

	describeTableAutoscaling(){
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
		return this.dynamodbprovider.describeTable(table_name, false).then((results) => {

			du.info('Table found: '+table_name);
			return results;

		}).catch(() => {

			du.info('Unable to find table '+table_name);
			return false;

		});

	}

	parseTableName(some_string){
		let table_name = this.parameters.get('tablename');

		return some_string.replace('{tablename}', table_name);

	}

}
