const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
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

		du.debug('Execute');

		return this.setParameters({argumentation: {messages: messages}, action: 'execute'})
			.then(() => this.preprocessing())
			.then(() => this.createIndexingDocument())
			.then(() => this.pushDocumentToCloudsearch())
			.then(() => this.setResponseCode())
			.then(() => this.respond());

	}

	preprocessing(){

		du.debug('Preprocessing');

		return this.parseMessages();

	}

	parseMessages(){

		du.debug('Parse Messages');

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

		du.debug('Create Indexing Document');

		let parsedmessagebodies = this.parameters.get('parsedmessagebodies');

		return this.indexingHelperController.createIndexingDocument(parsedmessagebodies).then(result => {
			this.parameters.set('indexingdocument', result);
			return true;
		});

	}

	pushDocumentToCloudsearch(){

		du.debug('Push Document To Cloudsearch');

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

		du.debug('Set Response Code');

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

		du.debug('Respond');

		let response_code = this.parameters.get('responsecode');

		return super.respond(response_code);

	}

}
