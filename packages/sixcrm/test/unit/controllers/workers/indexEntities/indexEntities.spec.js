

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

function getValidWorkerResponseTypes(){

	return ['success','decline','error','noaction'];

}

function getValidIndexingDocument(){

	return JSON.stringify([{
		id:uuidV4(),
		type:"add",
		fields:{
			name: 'A product name',
			entity_type:"product",
			active:true,
			sku: randomutilities.createRandomString(10),
			account:uuidV4(),
			created_at:timestamp.getISO8601(),
			updated_at:timestamp.getISO8601()
		}
	}]);

}

function getValidIndexElements(){

	return [
		{
			"entity_type":"product",
			"id":uuidV4(),
			"index_action":"add",
			"active":true,
			"sku": randomutilities.createRandomString(10),
			"account":uuidV4(),
			"created_at":timestamp.getISO8601(),
			"updated_at":timestamp.getISO8601()
		},
		{
			"entity_type":"product",
			"id":uuidV4(),
			"index_action":"delete"
		}
	];

}

function getValidLambdaMessages(){

	let valid_event_bodies = getValidIndexElements();

	return arrayutilities.map(valid_event_bodies, (valid_event_body) => {
		return {
			"ReceiptHandle": randomutilities.createRandomString(20),
			"Body":JSON.stringify(valid_event_body),
			"MD5OfBody":randomutilities.createRandomString(40),
			"MessageId":randomutilities.createRandomString(40)
		};
	});

}

function getValidCloudsearchDomainResponse(){

	return getValidCloudsearchDomainResponses()[0];

}

function getValidCloudsearchDomainResponses(){

	return [
		{
			status:'success',
			adds:1,
			deletes:1
		}
	]
}

describe('controllers/workers/indexEntities', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {
			const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
			let indexEntitiesController = new IndexEntitiesController();

			expect(objectutilities.getClassName(indexEntitiesController)).to.equal('IndexEntitiesController');
		});
	});

	describe('createIndexingDocument', () => {

		it('successfully creates a indexing document', () => {

			let index_elements =  getValidIndexElements();
			const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
			let indexEntitiesController = new IndexEntitiesController();

			indexEntitiesController.parameters.set('parsedmessagebodies', index_elements);

			return indexEntitiesController.createIndexingDocument().then(result => {
				expect(result).to.equal(true);
				expect(indexEntitiesController.parameters.store['indexingdocument']).to.be.defined;
				//validate the document;
			});

		});

	});

	describe('pushDocumentToCloudSearch', () => {

		beforeEach(() => {

			let cloudsearch_response = getValidCloudsearchDomainResponse();

			let indexing_document = getValidIndexingDocument();

			let mock_indexing_helper_controller = class {
				constructor(){

				}
				createIndexingDocument(){
					return Promise.resolve(indexing_document);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/Indexing.js'), mock_indexing_helper_controller);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/cloudsearch-provider.js'), class {
				uploadDocuments() {
					return Promise.resolve(cloudsearch_response);
				}
			});
		});

		it('successfully pushes a document to Cloudsearch', () => {

			let indexing_document = getValidIndexingDocument();

			const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
			let indexEntitiesController = new IndexEntitiesController();

			indexEntitiesController.parameters.set('indexingdocument', indexing_document);

			return indexEntitiesController.pushDocumentToCloudsearch()
				.then(result => {
					expect(result).to.equal(true);
					expect(indexEntitiesController.parameters.store['cloudsearchresponse']).to.be.defined;
				}).catch(error => {
					//Technical Debt:  Eliminate this, refactor.
					throw error;
				});

		});

	});

	describe('setResponseCode', () => {
		it('successfully sets response code', () => {
			let cloudsearch_responses = getValidCloudsearchDomainResponses();


			arrayutilities.map(cloudsearch_responses, cloudsearch_response => {
				const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
				let indexEntitiesController = new IndexEntitiesController();

				indexEntitiesController.parameters.set('cloudsearchresponse', cloudsearch_response);
				return indexEntitiesController.setResponseCode().then(result => {
					expect(result).to.equal(true);
					expect(indexEntitiesController.parameters.store['responsecode']).to.be.defined;
					if(cloudsearch_response.status == 'success'){
						expect(indexEntitiesController.parameters.store['responsecode']).to.equal('success');
					}else{
						expect(indexEntitiesController.parameters.store['responsecode']).to.equal('error');
					}
				});
			})

		});
	});

	describe('respond', () => {
		it('successfully responds', () => {
			let worker_response_types = getValidWorkerResponseTypes();

			arrayutilities.map(worker_response_types, worker_response_type => {

				const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
				let indexEntitiesController = new IndexEntitiesController();

				indexEntitiesController.parameters.set('responsecode', worker_response_type);
				let response_object = indexEntitiesController.respond();

				expect(objectutilities.getClassName(response_object)).to.equal('WorkerResponse');
				expect(response_object.getCode()).to.equal(worker_response_type);

			});
		});
	});

	describe('parseMessages', () => {
		it('successfully parses lambda messages', () => {
			let lambda_messages = getValidLambdaMessages();

			const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
			let indexEntitiesController = new IndexEntitiesController();

			indexEntitiesController.parameters.set('messages', lambda_messages);

			return indexEntitiesController.parseMessages().then(result => {
				expect(result).to.equal(true);
				expect(indexEntitiesController.parameters.store['parsedmessagebodies']).to.be.defined;
				du.warning(indexEntitiesController.parameters.store['parsedmessagebodies']);
			});

		});
	});

	describe('execute', () => {

		it('successfully executes cloudsearch indexing method', () => {

			let indexing_document = getValidIndexingDocument();
			let cloudsearch_response = getValidCloudsearchDomainResponse();
			let lambda_messages = getValidLambdaMessages();

			let mock_indexing_helper_controller = class {
				constructor(){

				}
				createIndexingDocument(){
					return Promise.resolve(indexing_document);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/Indexing.js'), mock_indexing_helper_controller);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/cloudsearch-provider.js'), class {
				uploadDocuments() {
					return Promise.resolve(cloudsearch_response);
				}
			});

			const IndexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
			let indexEntitiesController = new IndexEntitiesController();

			return indexEntitiesController.execute(lambda_messages).then(result => {
				expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
				expect(result.getCode()).to.equal('success');
			});

		});

	});

});
