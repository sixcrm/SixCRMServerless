'use strict';

let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = function(results){

    du.debug('Transformation Function');

    return new Promise((resolve) => {

        du.info(results);

        return resolve(results);

    });

}
