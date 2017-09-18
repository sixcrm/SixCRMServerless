'use strict';
const _ = require('underscore');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');

class creditCardController extends entityController {

    constructor(){
        super('creditcard');
    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('customerController', 'listByCreditCardID', {id:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let customers = data_acquisition_promises[0];

        if(_.has(customers, 'customers') && arrayutilities.nonEmpty(customers.customers)){
          arrayutilities.map(customers.customers, (customer) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Customer', object: customer}));
          });
        }

        return return_array;

      });

    }

    getAddress(creditcard){
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

    storeCreditCard(creditcard) {

        du.debug('Store Credit Card.');

        return new Promise((resolve, reject) => {

            this.queryBySecondaryIndex({field:'number', index_value: creditcard.number, index_name: 'number-index'})
              .then((result) => this.getResult(result))
              .then((creditcards) => {

                  du.warning(creditcards);

                  var card_identified = false;

                  if(!_.isArray(creditcards) && creditcards){

                      return resolve(creditcard);
                  } else {
                      creditcards = [];
                  }

                  creditcards.forEach(function(item){

                      if(card_identified == false && this.isSameCreditCard(creditcard, item)){

                          card_identified = item;

                      }

                  });

                  if(_.has(card_identified, 'id')){

                      return resolve(card_identified);

                  }else if(card_identified == false){

                      return this.create({entity: creditcard}).then((data) => {

                          return resolve(data);

                      }).catch((error) => {

                          return reject(error);

                      });

                  } else {

                      return reject(eu.getError('server','Card not identified.'));

                  }

              }).catch((error) => {
                  reject(error);
              });

        });

    }

    isSameCreditCard(creditcard1, creditcard2){

        if(!_.isEqual(creditcard1.ccv, creditcard2.ccv)){
            return false;
        }

        if(!_.isEqual(creditcard1.number, creditcard2.number)){
            return false;
        }

        if(!_.isEqual(creditcard1.expiration, creditcard2.expiration)){
            return false;
        }

        if(!_.isEqual(creditcard1.address, creditcard2.address)){

            return false;
        }

        return true;
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

module.exports = new creditCardController();
