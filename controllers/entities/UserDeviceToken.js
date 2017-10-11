'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class userDeviceTokenController extends entityController {

    constructor(){
        super('userdevicetoken');
    }

    getUserDeviceTokensByUser(user){

        du.debug('Get Device Token By User');

        return new Promise((resolve, reject) => {

            return this.queryBySecondaryIndex({field:'user', index_value: user, index_name: 'user-index'})
              .then((results) => this.getResult(results))
              .then((user_device_tokens) => {

                  if(_.isArray(user_device_tokens)){

                      let resolve_object = {};

                      resolve_object[this.descriptive_name+'s'] = user_device_tokens;

                      return resolve(resolve_object);

                  }else{

                      return resolve(null);

                  }

              }).catch((error) => {

                  return reject(error);

              });

        });

    }

}

module.exports = new userDeviceTokenController();
