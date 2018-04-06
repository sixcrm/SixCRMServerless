'use strict';
const _ = require('underscore');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
//const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities');

//const helper = new CreditCardHelperController();

module.exports = class CreditCardController extends entityController {

    constructor(){

      super('creditcard');

      this.search_fields = ['name'];

      this.encrypted_attribute_paths = [
        'token.token'
      ];

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.get({id}).then(creditcard => this.listCustomers(creditcard))
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let customers = data_acquisition_promises[0];

        if (arrayutilities.nonEmpty(customers)) {
          arrayutilities.map(customers, customer => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Customer', object: customer}));
          });
        }

        return return_array;

      });

    }

    create({entity}) {

      du.debug('CreditCard.create()');

      //Technical Debt:  Validate that this is a creditcard with a number and cvv etc...

      return Promise.resolve(entity)
      .then((entity) => {

        this.assignPrimaryKey(entity);
        this.setLastFour(entity);
        this.setFirstSix(entity);

        return entity;

      }).then(entity => {

        if(!_.has(this, 'tokenController')){
          const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
          this.tokenController = new TokenController();
        }

        return Promise.all([entity, this.tokenController.setToken(entity)]);

      }).then(([entity, token]) => {

        delete entity.number;
        delete entity.cvv;
        entity.token = token;

        return entity;

      }).then(entity => {

        return super.create({entity});

      });

    }

    update({entity}) {

      du.debug('CreditCard.update()');

      return Promise.resolve(entity)
      .then((entity) => this.exists({entity: entity, return_entity: true}))
      .then((existing_creditcard) => {

        if(!_.has(existing_creditcard, 'id')){
          eu.throwError('not_found', 'Credit card not found.');
        }

        return existing_creditcard;

      }).then((existing_creditcard) => {

        let update_entity = objectutilities.transcribe(
          {
            address:'address',
            customers:'customers',
            name: 'name',
            expiration: 'expiration'
          },
          existing_creditcard,
          existing_creditcard,
          false
        );

        return update_entity;

      }).then((update_entity) => {

        return super.update({entity: update_entity});

      });

    }

    delete({id}){

      du.debug('CreditCard.delete()');

      return Promise.resolve(id)
      .then((id) => this.get({id: id}))
      .then((creditcard) => {

        if(_.isNull(creditcard)){
          eu.throwError('not_found', 'Unable to identify creditcard for delete.');
        }

        if(!_.has(this, 'tokenController')){
          const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
          this.tokenController = new TokenController();
        }

        return Promise.all([creditcard, this.tokenController.deleteToken(creditcard.token)]);

      }).then(([creditcard]) => {

        return super.delete({id: creditcard.id});

      });

    }

    //Technical Debt:  Update to support only supported properties
    updateProperties({id, properties}) {
        this.setLastFour(properties);
        return super.updateProperties({id, properties});
    }

  	listCustomers(creditcard) {

  		du.debug('List Customers');

  		if(_.has(creditcard, "customers") && arrayutilities.nonEmpty(creditcard.customers)){

        //Nick:  Use a list query here, not parallel get queries
  			return Promise.all(arrayutilities.map(creditcard.customers, customer => {
  				return this.executeAssociatedEntityFunction('CustomerController', 'get', {id: customer});
  			})).then(customers => arrayutilities.filter(customers, customer => !_.isNull(customer)));

  		}

  		return Promise.resolve(null);

  	}

    assureCreditCard(creditcard){

      du.debug('Assure Credit Card', creditcard);

      if (this.sanitization) {
        eu.throwError('server', 'Cannot Assure Credit Card while sanitizing results');
      }

      if(!_.has(creditcard, 'last_four')){
        this.setLastFour(creditcard);
      }

      return this.queryBySecondaryIndex({field:'last_four', index_value: creditcard.last_four, index_name: 'last_four-index'}).then(results => {

        if(_.has(results, 'creditcards')){

          if(arrayutilities.nonEmpty(results.creditcards)){

            let found_card = arrayutilities.find(results.creditcards, (result) => {
              return this.sameCard(creditcard, result);
            });

            if(!_.isUndefined(found_card)){
              return found_card;
            }

          }

          return this.create({entity: creditcard});

        }

        return true;

      });

    }

    setLastFour(attributes) {
      if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
        attributes.last_four = attributes.number.slice(-4);
      }
    }

    setFirstSix(attributes) {
      if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
        attributes.first_six = attributes.number.substring(0, 6);
      }
    }

}
