'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class accessKeyController extends entityController {

    constructor(){
        super('accesskey');
    }

    /*
    WARNING:  This method is NOT to be exposed via the Graph API.
    NOTE: This method is used in the transactional endpoint acquiretoken.  Therefore, anyone with a graph JWT could effectively scan database for all keys and secrets if provided access to this methid.
    */
    getAccessKeyByKey(access_key){

      du.debug('Get Access Key By Key');

      this.disableACLs();
      return this.getBySecondaryIndex({field: 'access_key', index_value: access_key, index_name: 'access_key-index'}).then(access_key => {
        this.enableACLs();
        return access_key;
      });

    }

}

module.exports = new accessKeyController();
