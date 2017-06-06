'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities');
var entityController = global.routes.include('controllers', 'entities/Entity.js');
const NMIController = global.routes.include('controllers', 'vendors/merchantproviders/NMI.js');

class merchantProviderController extends entityController {

    constructor(){
        super('merchantprovider');
    }

    issueRefund(transaction, refund){

        return this.get(transaction.merchant_provider)
      .then((merchant_provider) => this.validate(merchant_provider))
      .then((merchant_provider) => {
        //Technical Debt: If this thing is still active.
          let processor = this.createProcessorClass(merchant_provider);

        //build this thing...
          let parameters = {};

          return processor.refund(parameters);

      });

    }

    createProcessorClass(merchantprovider){

        du.debug('Create Processor Class');

  	  if(merchantprovider.processor == 'NMI'){

        let _nmi = new NMIController({
            username: merchantprovider.username,
            password: merchantprovider.password,
            endpoint: merchantprovider.endpoint
        });

        return _nmi;

    	}else{
        throw new Error('Unrecognized merchant provider: '+merchantprovider.processor);
    }

    }

}

module.exports = new merchantProviderController();
