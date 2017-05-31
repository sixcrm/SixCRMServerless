'use strict';
const entityController = global.routes.include('controllers', 'entities/Entity.js');

class userSettingController extends entityController {

    constructor() {
        super('usersetting');
    }

}

module.exports = new userSettingController();
