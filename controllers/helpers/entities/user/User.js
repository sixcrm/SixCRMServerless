'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class UserHelperController{

  constructor(){

  }

  getFullName(user){

    du.debug('Get Full Name');

    let full_name = [];

    if(_.has(user, 'first_name')){
      full_name.push(user.first_name);
    }

    if(_.has(user, 'last_name')){
      full_name.push(user.last_name);
    }

    full_name = arrayutilities.compress(full_name, ' ', '');

    if(stringutilities.nonEmpty(full_name)){
      return full_name;
    }

    return null;

  }

  getAddress(user){

    du.debug('Get Address');

    if(_.has(user, 'address')){

        return user.address;

    }

    return null;

  }

}
