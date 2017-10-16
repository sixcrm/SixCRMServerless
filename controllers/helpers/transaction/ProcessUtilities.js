'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class ProcessUtilities {

    constructor(){

    }

    makeGeneralBrandString(a_string){

      du.debug('Make General Brand String');

      return stringutilities.removeWhitespace(a_string).toLowerCase();

    }

}
