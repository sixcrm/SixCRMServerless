'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');


var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class merchantProviderController extends entityController {

    constructor(){

      super('merchantprovider');

      this.search_fields = ['name'];

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('merchantProviderGroupController', 'listByMerchantProviderID', {id:id}),
        //this.executeAssociatedEntityFunction('transactionController', 'listByMerchantProviderID', {id:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let merchantprovidergroups = data_acquisition_promises[0];
        //let transactions = data_acquisition_promises[1];

        if(arrayutilities.nonEmpty(merchantprovidergroups)){
          arrayutilities.map(merchantprovidergroups, (merchantprovidergroup) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Merchant Provider Group', object: merchantprovidergroup}));
          });
        }

        /*
        if(_.has(transactions, 'transactions') && arrayutilities.nonEmpty(transactions.transactions)){
          arrayutilities.map(transactions.transactions, (transaction) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Transaction', object:transaction}));
          });
        }
        */

        return return_array;

      });

    }

}

module.exports = new merchantProviderController();
