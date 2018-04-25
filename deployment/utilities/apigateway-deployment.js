//const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
//const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
//const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const APIGatewayProvider = global.SixCRM.routes.include('controllers', 'providers/apigateway-provider.js');
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');

module.exports = class APIGatewayDeployment extends AWSDeploymentUtilities{

	constructor() {

		super();

		this.apigatewayprovider = new APIGatewayProvider();

	}

	deployCustomDomainNames(){

		du.debug('Deploy Custom Domain Names');

		const custom_domain_names = this.getConfigurationJSON('custom_domain_names');

		let custom_domain_name_promises = arrayutilities.map(custom_domain_names, custom_domain_name => {

			return () => this.deployCustomDomainName(custom_domain_name);

		});

		return arrayutilities.serial(custom_domain_name_promises).then(() => { return 'Complete'; });

	}

	deployCustomDomainName(){

		du.debug('Deploy Custom Domain Name');

	}

	getConfigurationJSON(filename){

		du.debug('Get Configuration JSON');

		//Technical Debt:  This needs to be expanded to support multiple definitions...
		return global.SixCRM.routes.include('deployment', 'apigateway/configuration/'+filename+'.json');

	}

}
