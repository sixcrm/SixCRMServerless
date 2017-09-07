'use strict';
require('../../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');

class Token {

  list(){

    du.debug('List');

    let all_schema = global.SixCRM.routes.path('model', 'tokens/all.json');
    let token_json = mvu.loadReferencesRecursive(global.SixCRM.routes.path('model', 'tokens/all.json'), (schema, uri) => {

      //du.warning(schema);

    });

  }

}

module.exports = new Token();
