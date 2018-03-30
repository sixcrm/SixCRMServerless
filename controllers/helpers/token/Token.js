'use strict';

//Technical Debt:  What's this doing here?!
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mbu = global.SixCRM.routes.include('lib','model-builder-utilities.js');

module.exports = class Token {

  getTokensSchema(){

    du.debug('Token List');

    let model = mbu.build('tokens/all.json');

    return {tokens: model};

  }

}

