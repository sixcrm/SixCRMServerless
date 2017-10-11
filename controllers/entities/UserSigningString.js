'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class userSigningStringController extends entityController {

    constructor() {
        super('usersigningstring');
    }
}

module.exports = new userSigningStringController();
