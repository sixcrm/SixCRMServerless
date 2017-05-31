'use strict';
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class accessKeyController extends entityController {

    constructor(){
        super('accesskey');
    }

    getAccessKeyByKey(access_key){

        return this.getBySecondaryIndex('access_key', access_key, 'access_key-index');

    }

}

module.exports = new accessKeyController();
