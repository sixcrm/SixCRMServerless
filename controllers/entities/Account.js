
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class AccountController extends entityController {

    constructor(){

      super('account');

      this.search_fields = ['name'];

    }

    //Technical Debt: finish!
    associatedEntitiesCheck(){
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

    //Technical Debt:  This needs to be adjusted.  Master users should see all accounts but non-master users should see all accounts that they have ACLs on.
    list({pagination, fatal}){

      du.debug("List");

      let query_parameters = {};

      if(global.account !== '*'){

        query_parameters = this.appendFilterExpression(query_parameters, 'id = :accountv');
        query_parameters = this.appendExpressionAttributeValues(query_parameters, ':accountv', global.account);
        pagination = null;

      }

      return super.list({query_parameters: query_parameters, pagination: pagination, fatal: fatal});

    }

}

module.exports = AccountController;
