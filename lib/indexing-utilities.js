'use strict'
const validator = require('validator');
const _ =  require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const sqs = global.routes.include('lib', 'sqs-utilities.js');

//Technical Debt:  Note that the use of SQS may be deprecated.  Kinesis Firehose may be a more scalable, less burdensome manner of performing these tasks.
class IndexingUtilities {

    constructor(){

		//Technical Debt:  This needs to be configured...
        this.indexing_entities = [
            'campaign',
            'credit_card',
            'merchant_provider',
            'product_schedule',
            'product',
            'shipping_receipt',
            'customer',
            'transaction',
            'affiliate'
        ];

		//Technical Debt:  This needs to be configured...
        this.indexing_list = [
            'index_action',
            'entity_type',
            'id',
            'active',
            'email',
            'firstname',
            'lastname',
            'name',
            'phone',
            'sku',
            'tracking_number',
            'address',
            'amount',
            'alias',
            'first_six',
            'last_four',
            'account',
            'created_at',
            'updated_at',
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'zip',
            'country',
            'affiliate_id'
        ];

    }

    updateSearchIndex(entity){

        return new Promise((resolve) => {

            du.debug('updating search index for entity: ', entity);

            return resolve(true);

        });

    }

    removeFromSearchIndex(entity){

        entity.index_action = 'delete';

        du.debug('Remove from search index:', entity);

        return this.indexEntity(entity).then((entity) => this.pushToIndexingBucket(entity));

    }

    addToSearchIndex(entity){

        du.debug('Add to search index:', entity);

        entity.index_action = 'add';

        if(!_.has(entity, 'entity_type')){ return Promise.reject(new Error('Undefined "entity_type" field on entity indexing record.')); }

        //Note:  Re-enabled (6/24/2017) -  Seems to make sense, but may cause issues...
        if(!_.contains(this.indexing_entities, entity.entity_type)){ return Promise.resolve(true); }

        return this.indexEntity(entity).then((entity) => this.pushToIndexingBucket(entity));

    }

    indexEntity(entity){

        du.debug('Index Entity');

        return new Promise((resolve, reject) => {

            this.validateEntity(entity).then((validation) => {

                if(validation == true){

                    return resolve(entity);

                }else{

                    if(_.has(validation, 'errors')){

                        return reject(new Error('Entity failed validation: '+validation.errors.join(', ')));

                    }else{

                        return reject(new Error('Entity validation returned unrecognized structure.'));

                    }

                }

            }).catch((error) => {

                return reject(error);

            });

        })

    }

    validateEntity(entity){

        du.debug('Validate Entity');

        return new Promise((resolve, reject) => {

            let validation_errors = [];

            if(!_.has(entity, 'id')){

                validation_errors.push('Entity is missing the "id" property.');

            }else{

                if(!validator.isUUID(entity.id, '4')){

                    //Technical Debt:  This should be a property of the entity controller, not a array that must be managed (hard coded)
                    if(_.has(entity, 'entity_type') && _.contains(['user', 'notificationsetting', 'userdevicetoken', 'usersetting', 'notificationread'], entity.entity_type)){

                        du.debug('Entity ID type bypass: '+entity.entity_type);

                    }else{

                        validation_errors.push('Entity "id" is not of type UUIDV4.');

                    }

                }

            }

            if(!_.has(entity, 'index_action')){

                validation_errors.push('Entity is missing "index_action" property.');

            }else{

                if(!_.contains(['add', 'delete'], entity.index_action)){

                    validation_errors.push('Entity "index_action" property is unrecognized');

                }else{

                    if(entity.index_action == 'add'){

                        let has_indexable_field = this.indexing_list.some((indexable_field) => {
                            if(!_.contains(['id', 'index_action'], indexable_field) && _.has(entity, indexable_field)){
                                return true;
                            }
                        });

                        if(has_indexable_field !== true){

                            validation_errors.push('Entity has no indexable fields.');

                        }

                    }

                }

            }

            if(validation_errors.length > 0){

                return resolve({valid: false, errors: validation_errors});

            }else{

                return resolve(true);

            }

        });

    }

    pushToIndexingBucket(entity){

        du.debug('Push To Indexing Bucket');

        return new Promise((resolve, reject) => {

            if(!_.contains(this.indexing_entities, entity.entity_type)){

                du.debug('This is not a indexed entity type.');

                return resolve(false);

            }

            if(_.has(process.env, 'search_indexing_queue_url')){

                if(_.has(entity, 'index_action') && _.contains(['add', 'delete'], entity.index_action)){

                    if(_.has(entity, 'entity_type')){

                        //Technical Debt:  We should have known this way earlier in the execution chain...
                        if(_.contains(this.indexing_entities, entity.entity_type)){

                            let abridged_entity = this.createAbridgedEntity(entity);

                            let abridged_entity_string = JSON.stringify(abridged_entity);

                            sqs.sendMessage({message_body: abridged_entity_string, queue_url: process.env.search_indexing_queue_url}, (error, data) => {

                                if(_.isError(error)){ return reject(error); }

                                du.debug('Message sent to the queue.', data);

                                return resolve(true);

                            });

                        }else{

                            du.debug('This is not a indexed entity type.');
							// We don't need to index this thing.  Succeed quietly.
                            return resolve(false);

                        }

                    }else{

                        return reject(new Error('Indexable entities must have a "Entity Type".'));

                    }

                }else{

                    return reject(new Error('Indexable entities must have a "index_action" which is either "add" or "delete".'));

                }

            }else{

                return reject(new Error('Missing search_indexing_queue_url definition in the process.env object.'));

            }

        });

    }

    createAbridgedEntity(entity){

        du.debug('Create Abridged Entity');

        let abridged_entity = {};

        for (var k in entity){
            if(_.contains(this.indexing_list, k)){

                abridged_entity[k] = entity[k];

            }
        }

        return abridged_entity;

    }

    parseMessage(message){

        if(_.has(message, 'Body')){

            return JSON.parse(message.Body);

        }

        throw new Error('Unable to acquire message body.');

    }

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

        du.debug('Deserialized document:', processed_document);

        return processed_document;

    }

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

        du.debug('Updated document:', processed_document);

        return processed_document;

    }

    //Called by the worker
    createIndexingDocument(documents_array){

        du.debug('Creating Indexing Document', documents_array);

        let response = [];
        let adds = [];
        let deletes = [];

        documents_array.forEach((document) => {

            let parsed_document = this.parseMessage(document);

            du.debug('Parsed Document', parsed_document);

            if(_.has(parsed_document, 'index_action') && _.contains(['add','delete'], parsed_document.index_action) && _.has(parsed_document, 'id')){

                let processed_document = {};

                for(var k in parsed_document){

                    if(_.contains(['index_action','id'], k)){

                        if(k == 'index_action'){

                            processed_document['type'] = parsed_document[k];

                        }else{

                            processed_document[k] = parsed_document[k];

                        }

                    }else{

                        if(!_.has(processed_document, 'fields')){

                            processed_document.fields = {};

                        }


                        if(_.isString(parsed_document[k])){
                            processed_document.fields[k] = parsed_document[k];
                        }else{
                            processed_document.fields[k] = JSON.stringify(parsed_document[k]);
                        }

                    }

                }

                processed_document = this.assureSuggesterFields(processed_document);

                processed_document = this.deserializeAddress(processed_document);

                if(processed_document.type == 'add'){

                    adds.push(processed_document);

                }else{

                    deletes.push(processed_document);

                }

            }

        });

        if(adds.length > 0){
            response = response.concat(adds);
        }
        if(deletes.length > 0){
            response = response.concat(deletes);
        }

        return JSON.stringify(response);

    }

}

var iu = new IndexingUtilities();

module.exports = iu;
