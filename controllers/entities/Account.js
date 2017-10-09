'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class accountController extends entityController {

    constructor(){
        super('account');
    }

    //Technical Debt: finish!
    associatedEntitiesCheck({id}){
      return Promise.resolve([]);
    }

    //Technical Debt:  Shouldn't this be configured?
    getMasterAccount(){

      du.debug('Get Master Account');

      return Promise.resolve({
          "id":"*",
          "name": "Master Account",
          "active": true
      });

    }

    //Technical Debt:  Name seems ubiquitous
    getACL(account){

      du.debug('Get ACL');

      return this.executeAssociatedEntityFunction('userACLController', 'getACLByAccount', {account: account});

    }

    list({pagination, fatal}){

      du.debug("List");

      let query_parameters = {};

      if(global.account !== '*'){

        query_parameters = this.appendFilterExpression(query_parameters, 'id = :accountv');
        query_parameters = this.appendExpressionAttributeValues(query_parameters, ':accountv', global.account);

      }

      return super.list({query_parameters: query_parameters, pagination: pagination, fatal: fatal});

    }

}

module.exports = new accountController();
