
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

const RelayController = global.SixCRM.routes.include('controllers', 'workers/components/relay.js');

module.exports = class forwardMessageController extends RelayController {

	constructor(){

		super();

		this.message_limit = 10;

	}

	//Technical Debt: Test this
	execute(){

		return this.validateEnvironment()
			.then(() => this.getMessages())
			.then(() => this.invokeAdditionalLambdas())
			.then(() => this.forwardMessagesToWorkers())
			.then(() => this.handleWorkerResponseObjects())
			.then(() => this.respond('success'))
			.then((response) => {
				return response;
			})
			.catch((error) => {
				du.error(error);
				return this.respond('error');
			});

	}

	forwardMessagesToWorkers(){
		let params = this.parameters.get('params');
		let messages = this.parameters.get('messages');

		if (!arrayutilities.nonEmpty(messages)) {
			this.parameters.set('workerresponses', []);

			return Promise.resolve(true);
		}

		let worker_promises = [];

		if(params.bulk){

			worker_promises.push(() => this.invokeWorker(messages));

		}else{

			arrayutilities.map(messages, (message) => {
				worker_promises.push(() => this.invokeWorker(message));
			});

		}

		return arrayutilities.serialAll(worker_promises).then((worker_responses) => {
			this.parameters.set('workerresponses', worker_responses);

			return true;
		});

	}

	invokeWorker(message){
		let params = this.parameters.get('params');

		let WorkerController = global.SixCRM.routes.include('workers', params.workerfunction);

		return new WorkerController().execute(message).then(response => {

			if(params.bulk){
				return {worker_response_object: response, messages: message};
			}

			return {worker_response_object: response, message: message};

		});

	}

	handleWorkerResponseObjects(){
		let worker_response_objects = this.parameters.get('workerresponses');

		let handle_worker_response_object_promises = arrayutilities.map(worker_response_objects, worker_response_object => {
			return this.handleWorkerResponseObject(worker_response_object);
		});

		return Promise.all(handle_worker_response_object_promises)
			.then(handle_worker_response_object_promises => {
				return handle_worker_response_object_promises;
			});

	}

	handleWorkerResponseObject(worker_response_object){
		return this.validateWorkerResponseObject(worker_response_object)
			.then((worker_response_object) => this.handleError(worker_response_object))
			.then((worker_response_object) => this.handleFailure(worker_response_object))
			.then((worker_response_object) => this.handleSuccess(worker_response_object))
			.then((worker_response_object) => this.handleNoAction(worker_response_object))
			.then((worker_response_object) => this.handleDelete(worker_response_object));

	}

	validateWorkerResponseObject(compound_worker_response_object){
		global.SixCRM.validate(compound_worker_response_object, global.SixCRM.routes.path('model', 'workers/forwardmessage/compoundworkerresponseobject.json'));

		if(objectutilities.getClassName(compound_worker_response_object.worker_response_object) !== 'WorkerResponse'){
			du.error('Unrecognized worker response:', compound_worker_response_object.worker_response_object);
			throw eu.getError('server', 'Unrecognized worker response: '+compound_worker_response_object.worker_response_object);
		}

		return Promise.resolve(compound_worker_response_object);

	}

	handleNoAction(compound_worker_response_object){
		if(compound_worker_response_object.worker_response_object.getCode() !== 'noaction'){
			return Promise.resolve(compound_worker_response_object);
		}

		du.info('Is noaction.');

		//do nothing anyhow...

		return Promise.resolve(compound_worker_response_object);

	}

	handleFailure(compound_worker_response_object){
		let params = this.parameters.get('params');

		if(compound_worker_response_object.worker_response_object.getCode() !== 'decline'){
			return Promise.resolve(compound_worker_response_object);
		}

		du.info('Is fail.');

		if(!_.has(params, 'failure_queue')){

			du.warning('Fail Queue Not Configured');

			return Promise.resolve(compound_worker_response_object);

		}

		let body = this.createDiagnosticMessageBody(compound_worker_response_object);

		du.info("Updated Message Body: "+body);

		return this.pushMessagetoQueue({body: body, queue: params.failure_queue})
			.then(() => { return compound_worker_response_object; });

	}

	handleError(compound_worker_response_object){
		let params = this.parameters.get('params');

		if(compound_worker_response_object.worker_response_object.getCode() !== 'error'){
			return Promise.resolve(compound_worker_response_object);
		}

		du.info('Is error.');

		if(!_.has(params, 'error_queue')) {

			du.warning('Error Queue Not Configured');

			return Promise.resolve(compound_worker_response_object);

		}

		let body = this.createDiagnosticMessageBody(compound_worker_response_object);

		du.info("Updated Message Body: "+body);

		return this.pushMessagetoQueue({body: body, queue: params.error_queue})
			.then(() => { return compound_worker_response_object; });

	}

	handleSuccess(compound_worker_response_object){
		let params = this.parameters.get('params');

		if(compound_worker_response_object.worker_response_object.getCode() !== 'success'){
			return Promise.resolve(compound_worker_response_object);
		}

		du.info('Is success.');

		if(!_.has(params, 'destination_queue')){

			du.warning('Destination Queue Not Configured');

			return Promise.resolve(compound_worker_response_object);

		}

		return this.pushMessagetoQueue({body: compound_worker_response_object.message.Body, queue: params.destination_queue})
			.then(() => { return compound_worker_response_object; });

	}

	handleDelete(compound_worker_response_object){
		if(_.includes(['success', 'decline', 'error'], compound_worker_response_object.worker_response_object.getCode())){

			let messages = this.getCompoundWorkerResponseMessages(compound_worker_response_object);

			return this.deleteMessages(messages)
				.then(() => {
					return compound_worker_response_object;
				});

		}else{

			du.debug('Non-delete type: '+compound_worker_response_object.worker_response_object.getCode());

		}

		return Promise.resolve(compound_worker_response_object);

	}

	deleteMessages(messages){
		let params = this.parameters.get('params');

		if(!params.origin_queue) {
			return Promise.resolve(true);
		}

		global.SixCRM.validate(messages, global.SixCRM.routes.path('model','workers/sqsmessages.json'));

		let message_delete_promises = arrayutilities.map(messages, message => {
			du.info(message);
			return this.deleteMessage({
				queue: params.origin_queue,
				receipt_handle: this.getReceiptHandle(message)
			});
		});

		return Promise.all(message_delete_promises).then(() => {
			return true;
		});

	}

	//Technical Debt:  Does this belong here?
	getCompoundWorkerResponseMessages(compound_worker_response_object){

		let return_array = [];

		if(_.has(compound_worker_response_object, 'message')){

			return_array.push(compound_worker_response_object.message);

		}else if(_.has(compound_worker_response_object, 'messages')){

			arrayutilities.map(compound_worker_response_object.messages, message => {
				return_array.push(message);
			});

		}

		return return_array;

	}

};
