'use strict';
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class SMTPProviderController extends entityController {

    constructor(){

        super('smtpprovider');

    }

    //Technical Debt: finish!
    associatedEntitiesCheck({id}){
      return [];
    }

}

module.exports = new SMTPProviderController();
