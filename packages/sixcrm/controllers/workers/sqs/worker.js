
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

module.exports = class workerController {

	constructor(){

		this.setPermissions();
		this.initialize();

	}

	setPermissions(){
		//Technical Debt:  This is pretty gross, we should set the user to "system@sixcrm.com"

		this.permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
		this.permissionutilities.setPermissions('*',['*/*'],[])

	}

	initialize(){
		let parameter_validation = {
			'message': global.SixCRM.routes.path('model', 'workers/sqsmessage.json'),
			'messages':global.SixCRM.routes.path('model', 'workers/sqsmessages.json'),
			'parsedmessagebody': global.SixCRM.routes.path('model', 'workers/parsedmessagebody.json'),
			'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'session': global.SixCRM.routes.path('model', 'entities/session.json'),
			'responsecode': global.SixCRM.routes.path('model', 'workers/workerresponsetype.json')
		}

		let parameter_definition = {};

		const ParametersController = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new ParametersController({
			validation: parameter_validation,
			definition: parameter_definition
		});

	}

	augmentParameters(){
		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	preamble(message){
		return this.setParameters({argumentation: {message: message}, action: 'execute'})
			.then(() => this.parseMessageBody())
			.then(() => this.acquireRebill());

	}

	setParameters(parameters_object){
		this.parameters.setParameters(parameters_object);

		return Promise.resolve(true);

	}

	//Technical Debt: This is kind of gross...
	parseMessageBody(message, response_field){
		response_field = this.setResponseField(response_field);
		message = this.setMessage();

		let message_body;

		try{
			message_body = JSON.parse(message.Body);
		}catch(error){
			du.error(error);
			throw eu.getError('server', 'Unable to parse message body: '+message);
		}

		objectutilities.hasRecursive(message_body, response_field, true);

		this.parameters.set('parsedmessagebody', message_body);

		return Promise.resolve(true);

	}

	setMessage(message){
		if(!_.isUndefined(message) && !_.isNull(message) && objectutilities.isObject(message, false)){
			return message;
		}

		return this.parameters.get('message');

	}

	setResponseField(response_field){
		if(!_.isUndefined(response_field) && !_.isNull(response_field) && stringutilities.isString(response_field, false)){
			return response_field;
		}

		if(_.has(this, 'response_field')){
			return this.response_field;
		}

		return 'id';

	}

	acquireRebill(){
		let parsed_message_body = this.parameters.get('parsedmessagebody');

		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.get({id: parsed_message_body.id}).then((rebill) => {

			this.parameters.set('rebill', rebill);

			return true;

		});

	}

	acquireSession(){
		let parsed_message_body = this.parameters.get('parsedmessagebody');

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.get({id: parsed_message_body.id}).then((session) => {

			this.parameters.set('session', session);

			return true;

		});

	}

	respond(response, additional_information){
		const WorkerResponse = global.SixCRM.routes.include('controllers','workers/components/WorkerResponse.js');

		response = new WorkerResponse(response);

		if(!_.isUndefined(additional_information)){
			response.setAdditionalInformation(additional_information);
		}

		return response;

	}

	pushEvent({event_type, context, message_attributes}){
		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
