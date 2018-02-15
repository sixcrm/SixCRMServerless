'use strict';
const _ = require('underscore');

const du =  global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu =  global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities =  global.SixCRM.routes.include('lib', 'array-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class customerController extends entityController {

    constructor(){

        super('customer');

        this.search_fields = ['firstname', 'lastname'];

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('customerNoteController', 'listByCustomer', {customer:id}).then(customernotes => this.getResult(customernotes, 'customernotes')),
        this.executeAssociatedEntityFunction('sessionController', 'listByCustomer', {customer:id}).then(sessions => this.getResult(sessions, 'sessions'))
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let customernotes = data_acquisition_promises[0];
        let sessions = data_acquisition_promises[1];

        if(arrayutilities.nonEmpty(customernotes)){
          arrayutilities.map(customernotes, (customernote) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Customer Note', object: customernote}));
          });
        }

        if(arrayutilities.nonEmpty(sessions)){
          arrayutilities.map(sessions, (session) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Session', object: session}));
          });
        }

        return return_array;

      });

    }

    listByCreditCard({creditcard, pagination}){

      du.debug('List By Credit Card')

      return this.listByAssociations({id: this.getID(creditcard), field: 'creditcards', pagination: pagination});

    }

    getFullName(customer){

        du.debug('Get Full Name');

        let fullname = [];

        if(_.has(customer, 'firstname')){

            fullname.push(customer.firstname);

        }

        if(_.has(customer, 'lastname')){

            fullname.push(customer.lastname);

        }

        if(fullname.length > 0){

            return arrayutilities.compress(fullname, ' ', '');

        }

        return '';

    }

    getAddress(customer){

      du.debug('Get Address');

      return Promise.resolve(customer.address);

    }

    //Technical Debt:  This is somewhat messy.  Maybe we need to add this to a helper
    addCreditCard(customer, creditcard){

      du.debug('Add Credit Card');

      if(!_.has(customer, this.primary_key)){

        return this.get({id: customer}).then((_customer) => {

          //Technical Debt:  Bad validation
          if(!_.has(_customer, this.primary_key)){
            eu.throwError('server', 'Customer doesn\'t exist: '+customer);
          }

          return this.addCreditCard(_customer, creditcard);

        });

      }

      //Technical Debt: shitty validation
      if(!_.has(creditcard, 'id')){

        eu.throwError('bad_request','Invalid customer provided.');

      }

      if(_.has(customer, 'creditcards')){

        arrayutilities.isArray(customer.creditcards, true);

        if(_.contains(customer.creditcards, creditcard.id)){

            return Promise.resolve(customer);

        }else{

          customer.creditcards.push(creditcard.id);

          return this.update({entity: customer});

        }

      }else{

        customer['creditcards'] = [creditcard.id];

        return this.update({entity: customer});

      }

    }

    getCreditCards(customer){

      du.debug('Get Credit Cards');

      if(_.has(customer, "creditcards") && arrayutilities.nonEmpty(customer.creditcards)){

        let creditcardids = arrayutilities.map(customer.creditcards, creditcard => {
          return this.getID(creditcard);
        });

        let query_parameters = this.createINQueryParameters({field: 'id', list_array: creditcardids});

        return this.executeAssociatedEntityFunction('creditCardController', 'listByAccount', {query_parameters: query_parameters})
        .then(creditcards => this.getResult(creditcards, 'creditcards'));

      }

      return Promise.resolve(null);

    }


    getMostRecentCreditCard(customer){

      du.debug('Get Most Recent Credit Card');

      return this.get({id: this.getID(customer)}).then((customer) => {

        if(_.isNull(customer)){ return null; }

        return this.getCreditCards(customer).then((credit_cards) => {

          if(arrayutilities.nonEmpty(credit_cards)){

            let sorted_credit_cards = arrayutilities.sort(credit_cards, (a, b) => {

              if(a.updated_at > b.updated_at){ return 1; }

              if(a.updated_at < b.updated_at){ return -1; }

              return 0;

            });

            return sorted_credit_cards[0];

          }

          return null;

        });

      });

    }

    getCustomerByEmail(email){

      du.debug('Get Customer By Email');

      return this.getBySecondaryIndex({field: 'email', index_value: email, index_name: 'email-index'});

    }

    getCustomerSessions(customer){

      du.debug('Get Customer Sessions');

      return this.executeAssociatedEntityFunction('sessionController', 'getSessionByCustomer', this.getID(customer));

    }

    getCustomerRebills(customer){

      du.debug('Get Customer Rebills');

      return this.getCustomerSessions(customer).then((sessions) => {

        if(arrayutilities.nonEmpty(sessions)){

          let session_ids = []

          arrayutilities.map(sessions, (session) => {
            if(_.has(session, 'id')){
              session_ids.push(session.id);
            }
          });

          session_ids = arrayutilities.unique(session_ids);

          return this.executeAssociatedEntityFunction('rebillController', 'listBy', {list_array: session_ids, field: 'parentsession'})
          .then(rebills => this.getResult(rebills, 'rebills'));

        }

        return null;

      });

    }

    listCustomerSessions({customer, pagination}) {

      du.debug('List Customer Sessions');

      return this.executeAssociatedEntityFunction('sessionController', 'listByCustomer', {customer: customer, pagination: pagination});

    }

    // Technical Debt: This method ignores cursor and limit, returns all. Implementing proper pagination is tricky since
    // we retrieve data in 2 steps (sessions first, then rebills for each session and combine the results).
    listCustomerRebills({customer, pagination}) {

      du.debug('List Customer Rebills');

        return this.getCustomerSessions(customer).then((sessions) => {

            if (!sessions) {
                return this.createEndOfPaginationResponse('rebills', []);
            }

            let rebill_promises = arrayutilities.map(sessions, (session) => {
              return this.executeAssociatedEntityFunction('rebillController', 'listBySession', {session: session});
            });

            return Promise.all(rebill_promises).then((rebill_lists) => {

                let rebills = [];

                rebill_lists = rebill_lists || [];

                rebill_lists.forEach((rebill_list) => {

                    let rebills_from_list = rebill_list.rebills || [];

                    rebills_from_list.forEach((rebill) => {
                        rebills.push(rebill);
                    });
                });

                return this.createEndOfPaginationResponse('rebills', rebills);

            });

        });
    }

}

module.exports = new customerController();
