'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class accountController extends entityController {

    constructor(){
        super('account');
    }

    getMasterAccount(){

        return Promise.resolve({
            "id":"*",
            "name": "Master Account",
            "active": true
        });

    }

    getACL(account){

      return this.executeAssociatedEntityFunction('userACLController', 'getACLByAccount', {id: account.id});

    }

}

module.exports = new accountController();
