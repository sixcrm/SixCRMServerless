'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt:  Override the list method
class accessKeyController extends entityController {

    constructor(){
        super('accesskey');
    }

    getAccessKeyByKey(access_key){

      du.debug('Get Access Key By Key');

      return this.getBySecondaryIndex({field: 'access_key', index_value: access_key, index_name: 'access_key-index'});

    }

}

module.exports = new accessKeyController();
