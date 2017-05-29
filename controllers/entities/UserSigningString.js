'use strict';
const _ = require('underscore');
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');

const entityController = global.routes.include('controllers', 'entities/Entity.js');

class userSigningString extends entityController {

    constructor() {
        super(process.env.user_signing_strings_table, 'user_signing_string');
        this.table_name = process.env.user_signing_strings_table;
        this.descriptive_name = 'user_signing_string';
    }

}

module.exports = new userSigningString();
