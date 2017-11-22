'use strict'
const _ =  require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

module.exports = class IndexingHelperController {

  constructor(){

    this.document_transcription = {
      required:{
        id:'id',
        type: 'index_action'
      },
      optional:{}
    };

    this.setOptionalFields();

  }

  //Entrypoint
  createIndexingDocument(index_elements){

    du.debug('Creating Indexing Document');

    this.validateIndexElements(index_elements);

    let indexing_document_elements = arrayutilities.map(index_elements, (index_element) => {
      return this.createIndexDocument(index_element);
    });

    return Promise.all(indexing_document_elements)
    .then((indexing_document_elements) => this.packageDocument(indexing_document_elements));

  }

  setOptionalFields(){

    du.debug('Set Optional Fields');

    let optional_fields = global.SixCRM.routes.include('model','helpers/indexing/indexelement.json').properties;

    objectutilities.map(optional_fields, optional_field => {
      if(!_.contains(objectutilities.getValues(this.document_transcription.required), optional_field)){
        this.document_transcription.optional[optional_field] = optional_field;
      }
    });

  }

  transcribeDocument(index_element){

    du.debug('Transcribe Document');

    let required = objectutilities.transcribe(this.document_transcription.required, index_element, {}, true);

    let fields = objectutilities.transcribe(this.document_transcription.optional, index_element, {});

    let transcribed_document = objectutilities.clone(required);

    transcribed_document['fields'] = fields;

    return transcribed_document;

  }

  validateParsedDocument(parsed_document){

    du.debug('Validate Parsed Document');

    mvu.validateModel(parsed_document, global.SixCRM.routes.path('model','workers/indexEntities/rawdocument.json'));

    return parsed_document;

  }

  createIndexDocument(index_element){

    du.debug('Create Index Document');

    return Promise.resolve(index_element)
    .then((index_element) => this.validateIndexElement(index_element))
    .then((index_element) => this.transcribeDocument(index_element))
    .then((transcribed_document) => this.assureSuggesterFields(transcribed_document))
    .then((processed_document) => this.deserializeAddress(processed_document));

  }

  packageDocument(processed_document){

    du.debug('Package Document');

    return JSON.stringify(processed_document);

  }

  validateIndexElement(index_element){

    du.debug('Validate Index Element');

    mvu.validateModel(index_element, global.SixCRM.routes.path('model', 'helpers/indexing/indexelement.json'));

    return index_element;

  }

  validateIndexElements(index_elements){

    du.debug('Validate Index Elements');

    mvu.validateModel(index_elements, global.SixCRM.routes.path('model', 'helpers/indexing/indexelements.json'));

    return index_elements;

  }

  //Technical Debt:  Refactor
  assureSuggesterFields(processed_document){

      du.debug('Assuring Suggester Fields', processed_document);

      if(_.has(processed_document, 'fields')){

          //Technical Debt:  In the case that a entity has more than one of these filelds, there will be overwriting...
          if(!_.has(processed_document.fields, 'suggestion_field_1')){

              let suggestion_field_1 = '';

              if(_.has(processed_document.fields, 'name')){

                  suggestion_field_1 = processed_document.fields.name;

              }else if(_.has(processed_document.fields, 'firstname') || _.has(processed_document.fields, 'lastname')){

                  if(_.has(processed_document.fields, 'firstname')){
                      suggestion_field_1 += processed_document.fields.firstname;
                  }

                  if(_.has(processed_document.fields, 'lastname')){
                      if(suggestion_field_1.length > 0){ suggestion_field_1 += ' '; }
                      suggestion_field_1 += processed_document.fields.lastname;
                  }

              }else if(_.has(processed_document.fields, 'trackingnumber')){

                  suggestion_field_1 = processed_document.fields.trackingnumber;

              }else if(_.has(processed_document.fields, 'alias')){

                  suggestion_field_1 = processed_document.fields.alias;

              }else if(_.has(processed_document.fields, 'affiliate_id')){

                  suggestion_field_1 = processed_document.fields.affiliate_id;

              }

              if(suggestion_field_1.length > 0){

                  processed_document.fields['suggestion_field_1'] = suggestion_field_1;

              }

          }

      }

      //du.debug('Updated document:', processed_document);

      return processed_document;

  }

  //Technical Debt:  Refactor
  deserializeAddress(processed_document){

    du.debug('Deserialize Address');

    du.debug('Document to deserialize:', processed_document);

    if(_.has(processed_document, 'fields') && _.has(processed_document.fields, 'address')){

      let address_object = processed_document.fields.address;

      if(!_.isObject(address_object)){

        address_object = JSON.parse(address_object);

      }

      if(_.has(address_object, 'line1')){

        processed_document.fields['address_line_1'] = address_object.line1;

      }

      if(_.has(address_object, 'line2')){

        processed_document.fields['address_line_2'] = address_object.line2;

      }

      if(_.has(address_object, 'city')){

        processed_document.fields['city'] = address_object.city;

      }

      if(_.has(address_object, 'state')){

        processed_document.fields['state'] = address_object.state;

      }

      if(_.has(address_object, 'zip')){

        processed_document.fields['zip'] = address_object.zip;

      }

      if(_.has(address_object, 'country')){

        processed_document.fields['country'] = address_object.country;

      }

    }

    return processed_document;

  }

}
