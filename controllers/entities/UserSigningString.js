'use strict';
const entityController = global.routes.include('controllers', 'entities/Entity.js');

class userSigningStringController extends entityController {

    constructor() {
        super('usersigningstring');
    }
}

module.exports = new userSigningStringController();
