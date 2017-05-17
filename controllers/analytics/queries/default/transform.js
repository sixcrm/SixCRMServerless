'use strict';
let _ = require('underscore');
let mathutilities = global.routes.include('lib', 'math-utilities.js');
let du = global.routes.include('lib', 'debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        du.info(results);

        return resolve(results);

    });

}
