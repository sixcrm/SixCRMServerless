'use strict';
let du = require('../../../../lib/debug-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');
    return new Promise((resolve, reject) => {
        du.info(results);
        //Technical Debt:  Finish Me!
        let return_object = {};

        return resolve(return_object);

    });

}
