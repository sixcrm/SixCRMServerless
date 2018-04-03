
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class AccountHelperController {

  constructor(){

  }

  createPrototypeAccount(email){

    du.debug('Create Prototype Account');

    let account_id = stringutilities.getUUID();

    let proto_account = {
        id: account_id,
        name: email+'-pending-name',
        active: false
    };

    return proto_account;

  }

}
