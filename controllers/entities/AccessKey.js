'use strict';
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class accessKeyController extends entityController {

    constructor(){
        super('accesskey');
    }

    getAccessKeyByKey(access_key){

        return this.getBySecondaryIndex({field: 'access_key', index_value: access_key, index_name: 'access_key-index'});

    }

}

module.exports = new accessKeyController();
