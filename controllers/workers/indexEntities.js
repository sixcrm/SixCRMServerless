const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
var workerController = global.SixCRM.routes.include('controllers', 'workers/sqs/worker.js');

module.exports = class IndexEntitiesController extends workerController {

	constructor(){

		super();

		this.parameter_definition = {
			execute: {
				required: {
					messages: 'messages'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'parsedmessagebodies': global.SixCRM.routes.path('model', 'workers/indexEntities/parsedmessagebodies.json'),
			'indexingdocument': global.SixCRM.routes.path('model','workers/indexEntities/indexingdocument.json'),
			'cloudsearchresponse': global.SixCRM.routes.path('model','workers/indexEntities/cloudsearchresponse.json'),
			'responsecode': global.SixCRM.routes.path('model','workers/workerresponsetype.json')
		};

		const IndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/Indexing.js');

		this.indexingHelperController = new IndexingHelperController();

		this.cloudsearchprovider = new CloudsearchProvider();

		this.augmentParameters();

	}

	execute(messages){
		return this.setParameters({argumentation: {messages: messages}, action: 'execute'})
			.then(() => this.preprocessing())
			.then(() => this.createIndexingDocument())
			.then(() => this.pushDocumentToCloudsearch())
			.then(() => this.setResponseCode())
			.then(() => this.respond());

	}

	preprocessing(){
		return this.parseMessages();

	}

	parseMessages(){
		let messages = this.parameters.get('messages');

		let message_bodies = arrayutilities.map(messages, (message) => {

			try{

				return JSON.parse(message.Body);

			}catch(error){

				//send the message to the failure queue??
				du.error(error);
				return false;

			}

		});

		let parsed_message_bodies = arrayutilities.filter(message_bodies, (message_body) => {
			return objectutilities.isObject(message_body);
		});

		this.parameters.set('parsedmessagebodies', parsed_message_bodies);

		return Promise.resolve(true);

	}

	createIndexingDocument(){
		let parsedmessagebodies = this.parameters.get('parsedmessagebodies');

		return this.indexingHelperController.createIndexingDocument(parsedmessagebodies).then(result => {
			this.parameters.set('indexingdocument', result);
			return true;
		});

	}

	pushDocumentToCloudsearch(){
		let index_document = this.parameters.get('indexingdocument');

		return this.cloudsearchprovider.uploadDocuments(index_document)
			.then((response) => {

				this.parameters.set('cloudsearchresponse', response);
				return true;

			}).catch(error => {
				//Technical Debt: Refactor!
				//this.parameters.set('cloudsearchresponse', {status: 'error', adds: 0, deletes: 0});
				du.error(error);
				throw eu.getError(error);

			});

	}

	setResponseCode(){
		let cloudsearch_response = this.parameters.get('cloudsearchresponse', {fatal: false});

		if(cloudsearch_response.status == 'success'){
			this.parameters.set('responsecode', 'success');
		}else{
			//do we have an error?  Otherwise, it's a fail.
			this.parameters.set('responsecode', 'fail');
		}

		return Promise.resolve(true);

	}

	respond(){
		let response_code = this.parameters.get('responsecode');

		return super.respond(response_code);

	}

}
