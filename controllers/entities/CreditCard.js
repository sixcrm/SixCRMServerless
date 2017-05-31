'use strict';
const _ = require('underscore');
const entityController = global.routes.include('controllers', 'entities/Entity.js');
const du = global.routes.include('lib', 'debug-utilities');

class creditCardController extends entityController {

    constructor(){
        super('creditcard');
    }

    getAddress(creditcard){
        return Promise.resolve(creditcard.address);
    }

    storeCreditCard(creditcard) {

        du.debug('Store Credit Card.');

        var controller_instance = this;

        return new Promise((resolve, reject) => {

            controller_instance.queryBySecondaryIndex('number', creditcard.number, 'number-index')
              .then((result) => this.getResult(result))
              .then((creditcards) => {

                  var card_identified = false;

                  creditcards.forEach(function(item){

                      if(card_identified == false && controller_instance.isSameCreditCard(creditcard, item)){

                          card_identified = item;

                      }

                  });

                  if(_.has(card_identified, 'id')){

                      return resolve(card_identified);

                  }else if(card_identified == false){

                      return controller_instance.create(creditcard).then((data) => {

                          return resolve(data);

                      }).catch((error) => {

                          return reject(error);

                      });

                  } else {

                      return reject(new Error('Card not identified.'));

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
