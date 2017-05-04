'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

const du = require('../lib/debug-utilities.js');

const entityController = require('./Entity.js');

class userDeviceTokenController extends entityController {

    constructor(){
        super(process.env.user_device_tokens_table, 'userdevicetoken');
        this.table_name = process.env.user_device_tokens_table;
        this.descriptive_name = 'userdevicetoken';
    }

    getUserDeviceTokensByUser(user){

        du.debug('Get Device Token By User');

        return new Promise((resolve, reject) => {

            return this.queryBySecondaryIndex('user', user, 'user-index')
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
