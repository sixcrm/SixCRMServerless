'use strict';
var entityController = require('./Entity.js');

class accountController extends entityController {

    constructor(){
        super(process.env.accounts_table, 'account');
        this.table_name = process.env.accounts_table;
        this.descriptive_name = 'account';
    }

    getMasterAccount(){

        return Promise.resolve({
            "id":"*",
            "name": "Master Account",
            "active":"true"
        });

    }

}

module.exports = new accountController();