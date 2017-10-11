'use strict';
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
//Technical Debt: May need to embelish this to account for multiple settings for multiple accounts
class userSettingController extends entityController {

    constructor() {
        super('usersetting');
    }

}

module.exports = new userSettingController();
