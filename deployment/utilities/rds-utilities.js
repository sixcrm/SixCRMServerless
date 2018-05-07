const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class RDSDeployment extends AWSDeploymentUtilities {

	constructor(){

		super();

		const EC2Provider = global.SixCRM.routes.include('providers', 'ec2-provider.js');
		this.ec2provider = new EC2Provider();

		const RDSProvider = global.SixCRM.routes.include('providers', 'rds-provider.js');
		this.rdsprovider = new RDSProvider();

	}

	deploySubnetGroups(){

		du.debug('Deploy Subnet Groups');

		let subnet_group_definitions = this.getConfigurationJSON('subnetgroups');

		let subnet_group_promises = arrayutilities.map(subnet_group_definitions, (subnet_group_definition) => {

			return () => this.deploySubnetGroup(subnet_group_definition);

		});

		return arrayutilities.serial(subnet_group_promises).then(() => { return 'Complete'; });

	}

	deploySubnetGroup(cluster_definition){

		du.debug('Deploy Subnet Group');

		return this.subnetGroupExists(cluster_definition).then(result => {

			if(_.isNull(result)){
				du.info('Creating DB Subnet Group: '+cluster_definition.DBSubnetGroupName);
				return this.createDBSubnetGroup(cluster_definition);
			}

			du.info('DB Subnet Group Exists: '+cluster_definition.DBSubnetGroupName);
			return result;

		});

	}

	createDBSubnetGroup(cluster_definition){

		du.debug('Create DB Subnet Group');

		if(_.has(cluster_definition, 'SubnetNames') && arrayutilities.nonEmpty(cluster_definition.SubnetNames)){

			let argumentation = {
				Filters:[
					{
						Name: 'tag:Name',
						Values: cluster_definition.SubnetNames
					}
				]
			};

			return this.ec2provider.describeSubnets(argumentation).then(results => {

				if(_.has(results, 'Subnets') && arrayutilities.nonEmpty(results.Subnets)){
					if(results.Subnets.length == cluster_definition.SubnetNames.length){
						return arrayutilities.map(results.Subnets, subnet => subnet.SubnetId);
					}else{
						throw eu.getError('server', 'Mismatched array lengths: ', results.Subnets.length+':'+cluster_definition.SubnetNames.length);
					}
				}
				throw eu.getError('server', 'Unexpected results: ', results);
			}).then(subnets => {
				cluster_definition.SubnetIds = subnets;
				return this.rdsprovider.createDBSubnetGroup(cluster_definition);
			}).then(subnet_group => {

				return subnet_group.DBSubnetGroup;

			});

		}

		throw eu.getError('server', 'cluster_definition missing SubnetNames argument.');

	}

	subnetGroupExists(cluster_definition){

		du.debug('Subnet Group Exists');

		let parameters = {
			DBSubnetGroupName: cluster_definition.DBSubnetGroupName
		};

		return this.rdsprovider.describeDBSubnetGroups(parameters).then(results => {

			if(_.has(results, 'DBSubnetGroups') && _.isArray(results.DBSubnetGroups)){

				if(arrayutilities.nonEmpty(results.DBSubnetGroups)){
					if(results.DBSubnetGroups.length == 1){
						return results.DBSubnetGroups[0];
					}
					throw eu.getError('server', 'Multiple results returned', results);
				}

				return null;

			}

			throw eu.getError('server', 'Unexpected results: ', results);

		}).catch(error => {
			if(error.code == 'DBSubnetGroupNotFoundFault'){
				return null;
			}
		});

	}

	clusterExists(cluster_definition){

		du.debug('Cluster Exists');

		let argumentation = {
			DBClusterIdentifier: cluster_definition.DBClusterIdentifier
		};

		return this.rdsprovider.describeClusters(argumentation).then(result => {

			if(_.has(result, 'DBClusters') && _.isArray(result.DBClusters)){

				if(arrayutilities.nonEmpty(result.DBClusters)){
					if(result.DBClusters.length == 1){
						return result.DBClusters[0];
					}
					throw eu.getError('Multiple records returned: ', result);
				}

				return null;

			}

			throw eu.getError('server','Unexpected result: ', result);

		});

	}

	getConfigurationJSON(filename){

		du.debug('Get Configuration JSON');

		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'aurora/config/'+filename+'.json');

	}

}
