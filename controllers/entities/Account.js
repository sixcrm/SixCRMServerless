'use strict';
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

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

}

module.exports = new accountController();
