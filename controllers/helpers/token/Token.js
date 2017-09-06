'use strict';
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class Token {

  list(){

    du.debug('List');

    return global.SixCRM.routes.include('model', 'tokens/all.json');

  }

}

module.exports = new Token();
