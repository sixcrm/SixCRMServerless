'use strict';
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mbu = global.SixCRM.routes.include('lib','model-builder-utilities.js');

class Token {

  list(){

    du.debug('Token List');

    return mbu.build('tokens/all.json');

  }

}

module.exports = new Token();
