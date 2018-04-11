const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class CreditCardController extends entityController {

    constructor(){

      super('creditcard');

      this.search_fields = ['name'];

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

    get({id}){

      du.debug('Get Detokenized');

      return super.get({id: id})
      .then((result) => {

        if(_.isNull(result)){
          return result;
        }

        if(!_.has(result, 'token')){
          eu.throwError('server', 'Unable to detokenize: entity is missing the token field');
        }

        const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
        this.tokenController = new TokenController();

        return this.tokenController.getToken(result.token).then((detokenized_result) => {

          result.number = detokenized_result;
          return result;

        });

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

        return Promise.all([entity, this.tokenController.setToken({entity: entity.number})]);

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
      .then((entity) => {

        return this.exists({entity: entity, return_entity: true}).then((existing_creditcard) => {

          return {
            existing_creditcard: existing_creditcard,
            entity: entity
          };

        });

      })
      .then(({existing_creditcard, entity}) => {

        if(!_.has(existing_creditcard, 'id')){
          eu.throwError('not_found', 'Credit Card not found.');
        }

        return {
          existing_creditcard: existing_creditcard,
          entity: entity
        };

      }).then(({existing_creditcard, entity}) => {

        //Note:  We may need to assure that existing properties are not modified.
        let update_entity = objectutilities.transcribe(
          {
            address:'address',
            customers:'customers',
            name: 'name',
            expiration: 'expiration'
          },
          entity,
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
      .then((id) => this.exists({id: id, return_entity: true}))
      .then((existing_entity) => {

        if(!_.has(existing_entity, 'id')){
          eu.throwError('not_found', 'Unable to identify creditcard for delete.');
        }

        if(!_.has(this, 'tokenController')){
          const TokenController = global.SixCRM.routes.include('providers', 'token/Token.js');
          this.tokenController = new TokenController();
        }

        return Promise.all([existing_entity, this.tokenController.deleteToken(existing_entity.token)]);

      }).then(([existing_entity]) => {

        return super.delete({id: existing_entity.id});

      });

    }

    updateProperties({id, properties}) {

      du.debug('Update Properties');

      return Promise.resolve(id)
      .then((id) => {

        return this.exists({entity: {id: id}, return_entity: true}).then((existing_creditcard) => {

          return existing_creditcard;

        });

      })
      .then((existing_creditcard) => {

        if(!_.has(existing_creditcard, 'id')){
          eu.throwError('not_found', 'Credit Card not found.');
        }

        return existing_creditcard;

      }).then((existing_creditcard) => {

        //Note:  We may need to assure that existing properties are not modified.
        let update_entity = objectutilities.transcribe(
          {
            address:'address',
            customers:'customers',
            name: 'name',
            expiration: 'expiration'
          },
          properties,
          existing_creditcard,
          false
        );

        return update_entity;

      }).then((update_entity) => {

        return super.update({entity: update_entity});

      });

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

      if (!_.has(creditcard, 'last_four')) {
        this.setLastFour(creditcard);
      }

      //Technical Debt:  It might be better to query by the first_six
      return this.queryBySecondaryIndex({field: 'last_four', index_value: creditcard.last_four, index_name: 'last_four-index'})
      .then((result) => {

        if(_.has(result, 'creditcards') && _.isArray(result.creditcards) && arrayutilities.nonEmpty(result.creditcards)){

          if(!_.has(this, 'creditCardHelperController')){
            const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
            this.creditCardHelperController = new CreditCardHelperController();
          }

          let found_card = arrayutilities.find(result.creditcards, (existing_creditcard) => {
            return this.creditCardHelperController.sameCard(creditcard, existing_creditcard);
          });

          if(!_.isUndefined(found_card)){
            return found_card;
          }

        }

        return this.create({entity: creditcard});

      });

    }

    setLastFour(attributes) {

      du.debug('Set Last Four');

      if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
        attributes.last_four = attributes.number.slice(-4);
      }

    }

    setFirstSix(attributes) {

      du.debug('Set First Six');

      if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
        attributes.first_six = attributes.number.substring(0, 6);
      }

    }

}
