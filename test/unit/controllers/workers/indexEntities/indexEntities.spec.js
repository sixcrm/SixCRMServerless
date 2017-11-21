'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const querystring = require('querystring');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidWorkerResponseTypes(){

  return ['success','fail','error','noaction'];

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

  afterEach(() => {
    mockery.resetCache();
  });

  after(() => {
    mockery.deregisterAll();
  });

	describe('constructor', () => {
    it('successfully constructs', () => {
      let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

      expect(objectutilities.getClassName(indexEntitiesController)).to.equal('IndexEntitiesController');
    });
  });

  describe('createIndexingDocument', () => {

    it('successfully creates a indexing document', () => {

      let index_elements =  getValidIndexElements();
      let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

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
            createIndexingDocument(parsedmessagebodies){
                return Promise.resolve(indexing_document);
            }
        };

        mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/Indexing.js'), mock_indexing_helper_controller);

        mockery.registerMock(global.SixCRM.routes.path('lib', 'cloudsearch-utilities.js'), {
            uploadDocuments:(index_document) => {
                return Promise.resolve(cloudsearch_response);
            }
        });
    });

    it('successfully pushes a document to Cloudsearch', () => {

      let indexing_document = getValidIndexingDocument();

      let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

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
        let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

        indexEntitiesController.parameters.set('cloudsearchresponse', cloudsearch_response);
        return indexEntitiesController.setResponseCode().then(result => {
          expect(result).to.equal(true);
          expect(indexEntitiesController.parameters.store['responsecode']).to.be.defined;
          if(cloudsearch_response.status == 'success'){
            expect(indexEntitiesController.parameters.store['responsecode']).to.equal('success');
          }else{
            expect(indexEntitiesController.parameters.store['responsecode']).to.equal('fail');
          }
        });
      })

    });
  });

  describe('respond', () => {
    it('successfully responds', () => {
      let worker_response_types = getValidWorkerResponseTypes();

      arrayutilities.map(worker_response_types, worker_response_type => {

        let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

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

      let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

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
        createIndexingDocument(parsedmessagebodies){
          return Promise.resolve(indexing_document);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/Indexing.js'), mock_indexing_helper_controller);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'cloudsearch-utilities.js'), {
        uploadDocuments:(index_document) => {
          return Promise.resolve(cloudsearch_response);
        }
      });

      let indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');

      return indexEntitiesController.execute(lambda_messages).then(result => {
        expect(objectutilities.getClassName(result)).to.equal('WorkerResponse');
        expect(result.getCode()).to.equal('success');
      });

    });

  });

});
