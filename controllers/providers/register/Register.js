'use strict'
const _ = require('underscore');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');

class Register extends PermissionedController {

  constructor(){

    super();

    this.transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

  }

  refundTransaction({transaction, amount}){

    du.debug('Refund Transaction');

    return this.can({action: 'refund', object: 'register', fatal: true});


    //hydrate Transaction where necessary.
    //determine amount
    //validate amount

    /*
    const RefundController = global.SixCRM.routes.include('helpers', 'transaction/Refund.js');
    let refundController = new RefundController();

    refundController.refund({transaction: transaction, amount: amount});

    //respond with refund transaction
    */
  }

  voidTransaction({transaction}){

  }

  processTransaction({customer, blah}){

  }

}
