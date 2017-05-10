'use strict';
let _ = require('underscore');
let mathutilities = require('../../../../lib/math-utilities.js');
let du = require('../../../../lib/debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        du.info(results);

        return resolve(results);

    });

}
