const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const APIGatewayProvider = global.SixCRM.routes.include('controllers', 'providers/apigateway-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class APIGatewayDeployment extends AWSDeploymentUtilities{

	constructor() {

		super();

		this.apigatewayprovider = new APIGatewayProvider();

	}

	deployCustomDomainNames(){
		const custom_domain_names = this.getConfigurationJSON('custom_domain_names');

		let custom_domain_name_promises = arrayutilities.map(custom_domain_names, custom_domain_name => {

			return () => this.deployCustomDomainName(custom_domain_name);

		});

		return arrayutilities.serial(custom_domain_name_promises).then(() => { return 'Complete'; });

	}

	deployCustomDomainName(){
	}

	getConfigurationJSON(filename){
		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'apigateway/configuration/'+filename+'.json');

	}

}
