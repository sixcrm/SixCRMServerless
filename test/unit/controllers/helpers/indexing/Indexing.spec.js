
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const uuidV4 = require('uuid/v4');

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const randomutilities = require('@6crm/sixcrmcore/util/random').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const IndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/Indexing.js');

function getValidProcessedDocument(){

	return {
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
	};

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
function getValidIndexElement(){

	return getValidIndexElements()[0];

}

describe('controllers/helpers/indexing/Indexing.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {
			let indexingHelperController = new IndexingHelperController();

			expect(objectutilities.getClassName(indexingHelperController)).to.equal('IndexingHelperController');
		});

	});

	describe('setOptionalFields', () => {

		it('successfully sets the optional fields for the transcription object', () => {
			let indexingHelperController = new IndexingHelperController();

			indexingHelperController.document_transcription.optional = {};

			let optional_fields = objectutilities.getKeys(global.SixCRM.routes.include('model','helpers/indexing/indexelement.json').properties);
			let required_fields = objectutilities.getValues(indexingHelperController.document_transcription.required);

			indexingHelperController.setOptionalFields();

			expect(objectutilities.getKeys(indexingHelperController.document_transcription.optional).length).to.equal(optional_fields.length - required_fields.length);

		});

	});

	describe('transcribeDocument', () => {

		it('successfully transcribes document', () => {
			let index_element = getValidIndexElement();
			let indexingHelperController = new IndexingHelperController();
			let transcribed_document = indexingHelperController.transcribeDocument(index_element);

			expect(transcribed_document).to.have.property('type');
			expect(transcribed_document).to.have.property('id');
			expect(transcribed_document).to.have.property('fields');
			expect(transcribed_document.fields).to.have.property('entity_type');
			expect(transcribed_document.fields.entity_type).to.equal(index_element.entity_type);

		});

	});

	describe('validateIndexElement', () => {

		it('successfully validates index element', () => {
			let index_element = getValidIndexElement();
			let indexingHelperController = new IndexingHelperController();
			let validated_index_element = indexingHelperController.validateIndexElement(index_element);

			expect(validated_index_element).to.deep.equal(index_element);

		});

	});

	describe('validateIndexElements', () => {

		it('successfully validates index elements', () => {

			let index_elements = getValidIndexElements();
			let indexingHelperController = new IndexingHelperController();
			let validated_index_elements = indexingHelperController.validateIndexElements(index_elements);

			expect(validated_index_elements).to.deep.equal(index_elements);

		});

	});

	describe('packageDocument', () => {

		it('successfully packages document', () => {

			let prepackaged = getValidProcessedDocument();
			let indexingHelperController = new IndexingHelperController();
			let packaged = indexingHelperController.packageDocument(prepackaged);


			expect(typeof packaged).to.equal('string');
			expect(JSON.parse(packaged)).to.deep.equal(prepackaged);

		});

	});

	describe('assureSuggesterFields', () => {

		it('successfully assures suggester fields', () => {

			let processed_document = getValidProcessedDocument();
			let indexingHelperController = new IndexingHelperController();
			let assured_suggester_fields_document = indexingHelperController.assureSuggesterFields(processed_document);

			expect(assured_suggester_fields_document.fields).to.have.property('suggestion_field_1');
			expect(assured_suggester_fields_document.fields.suggestion_field_1).to.equal(processed_document.fields.name);

		});

	});

	describe('deserializeAddress', () => {

		it('successfully deserializes a address', () => {

			let processed_document = getValidProcessedDocument();

			let fake_address = {
				line1:'13 Address St.',
				line2:'Apartment Whatever',
				city: 'Hamburgers',
				state: 'OH',
				zip: 12345,
				country: 'US'
			};

			processed_document.fields.address = JSON.stringify(fake_address);

			let indexingHelperController = new IndexingHelperController();
			let deserialized_address_document = indexingHelperController.deserializeAddress(processed_document);

			expect(deserialized_address_document.fields).to.have.property('address_line_1');
			expect(deserialized_address_document.fields).to.have.property('address_line_2');
			expect(deserialized_address_document.fields).to.have.property('city');
			expect(deserialized_address_document.fields).to.have.property('state');
			expect(deserialized_address_document.fields).to.have.property('zip');
			expect(deserialized_address_document.fields).to.have.property('country');

			expect(deserialized_address_document.fields).not.to.have.property('address');

			expect(deserialized_address_document.fields.address_line_1).to.equal(fake_address.line1);
			expect(deserialized_address_document.fields.address_line_2).to.equal(fake_address.line2);
			expect(deserialized_address_document.fields.city).to.equal(fake_address.city);
			expect(deserialized_address_document.fields.state).to.equal(fake_address.state);
			expect(deserialized_address_document.fields.zip).to.equal(fake_address.zip);
			expect(deserialized_address_document.fields.country).to.equal(fake_address.country);

		});

	});

	describe('createIndexDocument', () => {

		it('successfully creates a index document', () => {

			let index_element = getValidIndexElement();
			let indexingHelperController = new IndexingHelperController();

			return indexingHelperController.createIndexDocument(index_element).then(result => {

				expect(typeof result).to.equal('object');

				expect(result).to.have.property('id');
				expect(result).to.have.property('type');
				expect(result).to.have.property('fields');
				expect(result.fields).to.have.property('entity_type');

				expect(result.id).to.equal(index_element.id);
				expect(result.index_action).to.equal(index_element.type);
				expect(result.fields.entity_type).to.equal(index_element.entity_type);
				expect(result.fields.created_at).to.equal(index_element.created_at);
				expect(result.fields.updated_at).to.equal(index_element.updated_at);
				expect(result.fields.active).to.equal(index_element.active);
				expect(result.fields.sku).to.equal(index_element.sku);
				expect(result.fields.account).to.equal(index_element.account);

			});

		});

	});

	describe('createIndexingDocument', () => {

		it('successfully creates a indexing document', () => {

			let index_elements = getValidIndexElements();
			let indexingHelperController = new IndexingHelperController();

			return indexingHelperController.createIndexingDocument(index_elements).then(result => {
				expect(typeof result).to.equal('string');
				let parsed_result = JSON.parse(result);
				//Technical Debt:  More tests here...
			});

		});

	});

});
