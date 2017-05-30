'use strict';
const entityController = global.routes.include('controllers', 'entities/Entity.js');

class userSigningString extends entityController {

    constructor() {
        super(process.env.user_signing_strings_table, 'usersigningstring');
        this.table_name = process.env.user_signing_strings_table;
        this.descriptive_name = 'usersigningstring';
    }

}

module.exports = new userSigningString();
