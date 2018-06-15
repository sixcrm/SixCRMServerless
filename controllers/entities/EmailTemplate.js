
const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class EmailTemplateController extends entityController {

	constructor(){

		super('emailtemplate');

		this.search_fields = ['name'];

	}

	listBySMTPProvider({smtpprovider: smtpprovider, pagination: pagination}){

		du.debug('List By SMTP Provider');

		let query_parameters = {
			filter_expression: '#f1 = :smtpprovider_id',
			expression_attribute_values: {
				':smtpprovider_id':this.getID(smtpprovider)
			},
			expression_attribute_names: {
				'#f1':'smtp_provider'
			}
		};

		//Technical Debt:  Use listByAccount()
		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	getSMTPProvider(emailtemplate){

		du.debug('Get SMTP Provider', emailtemplate);

		if(_.has(emailtemplate, 'smtp_provider')){

			du.debug('Get SMTP Provider - returning from controller.');

			return this.executeAssociatedEntityFunction('SMTPProviderController', 'get', {id: emailtemplate.smtp_provider});

		}else{

			du.debug('Get SMTP Provider - returning null.');

			return Promise.resolve(null);

		}

	}

}

