
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

module.exports = class SMTPProvider {

	constructor(smtp_provider){

		this.required_options = ['hostname', 'username', 'password'];
		this.optional_options = ['port'];

		this.setOptions(smtp_provider);

		this.setConnection();

	}

	setOptions(smtp_provider){
		this.required_options.forEach((required_option) => {

			if(!_.has(smtp_provider, required_option)){

				throw eu.getError('server','SMTP Object requires "'+required_option+'" option.');

			}else{

				this[required_option] = smtp_provider[required_option];

			}

		});

		this.optional_options.forEach((optional_option) => {

			if(_.has(smtp_provider, optional_option)){

				this[optional_option] = smtp_provider[optional_option];

			}

		});

	}

	getOptions(){
		let options = arrayutilities.merge(this.required_options, this.optional_options);

		let options_object = {};

		options.forEach((option) => {

			if(_.has(this, option)){
				options_object[option] = this[option];
			}

		});

		this.validateOptions(options_object);

		return options_object;

	}

	validateOptions(options_object){
		global.SixCRM.validate(options_object, global.SixCRM.routes.path('model', 'general/smtp_options.json'));

	}

	setConnection(){
		let options = this.getOptions();

		const SMTPProvider = global.SixCRM.routes.include('controllers', 'providers/smtp-provider.js');
		this.connection = new SMTPProvider(options);

	}

	send(send_object){
		return this.connection.send(send_object);

	}

}
