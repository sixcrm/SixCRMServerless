'use strict';
const _ = require('underscore');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities');

const helper = new CreditCardHelperController();

module.exports = class CreditCardController extends entityController {

    constructor(){

      super('creditcard');

      this.search_fields = ['name'];

      this.encrypted_attribute_paths = [
          'number',
          'ccv'
      ];
    }

    censorEncryptedAttributes(entity) {
        const custom_censor_fn = (attr_path, attr_value) => {
            switch (attr_path) {
                case 'number':
                    return helper.lastFour(this.encryptionhelper.decrypt(entity, attr_value));
                default:
                    return '****';
            }
        }

        return super.censorEncryptedAttributes(entity, custom_censor_fn);
    }

    setLastFour(attributes) {
        if (_.has(attributes, 'number') && stringutilities.isString(attributes.number)) {
            attributes.last_four = attributes.number.slice(-4);
        }
    }

    create({entity}) {
        this.setLastFour(entity);
        return super.create({entity});
    }

    update({entity}) {
        this.setLastFour(entity);
        return super.update({entity});
    }

    updateProperties({id, properties}) {
        this.setLastFour(properties);
        return super.updateProperties({id, properties});
    }

	listCustomers(creditcard) {
		du.debug('List Customers');

		if(_.has(creditcard, "customers") && arrayutilities.nonEmpty(creditcard.customers)){
			return Promise.all(arrayutilities.map(creditcard.customers, customer => {
				return this.executeAssociatedEntityFunction('CustomerController', 'get', {id: customer});
			}));
		}

		return Promise.resolve(null);
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

    assureCreditCard(creditcard){

      du.debug('Assure Credit Card', creditcard);

      if (this.sanitization) {
          eu.throwError('server', 'Cannot Assure Credit Card while sanitizing results');
      }

      this.assignPrimaryKey(creditcard);
      this.setLastFour(creditcard);

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

    sameCard(creditcard, test_card, fatal){

      du.debug('Same Card');

      fatal = (_.isUndefined(fatal))?false:fatal;

      let bad_field = arrayutilities.find(objectutilities.getKeys(creditcard), creditcard_field => {

        if(!_.has(test_card, creditcard_field)){
          return true;
        }

        let test_field = test_card[creditcard_field];
        let fact_field = creditcard[creditcard_field];

        if(typeof test_field !== typeof fact_field){
          return true;
        }

        if((_.isString(fact_field) || _.isNumber(fact_field)) && fact_field !== test_field){
          return true;
        }

        if(_.isObject(fact_field)){
          if(!_.isMatch(fact_field, test_field)){
            return true;
          }
        }

        return false;

      });

      if(!_.isUndefined(bad_field)){

        let message = 'Cards do not match.  Bad field: '+bad_field;

        if(fatal == true){
          eu.throwError('server', message);
        }

        return false;

      }

      return true;

    }

    getAddress(creditcard){

      du.debug('Get Address');

      return Promise.resolve(creditcard.address);

    }

    getBINNumber(creditcard){

      du.debug('Get BIN Number');

      let cc_number = null;

      if(_.has(creditcard, 'number')){

        cc_number = creditcard.number;

      }else if(_.isString(creditcard)){

        cc_number = creditcard;

      }

      if(!_.isNull(cc_number)){

        cc_number = cc_number.slice(0,6);

      }

      return cc_number;

    }

    createCreditCardObject(input_object){

      var creditcard = {
          number: input_object.number,
          expiration: input_object.expiration,
          ccv: input_object.ccv,
          name: input_object.name,
          address: input_object.address
      };

      return Promise.resolve(creditcard);

    }

}
