'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class userSigningStringController extends entityController {

    constructor() {
        super('usersigningstring');
    }
}

module.exports = new userSigningStringController();
