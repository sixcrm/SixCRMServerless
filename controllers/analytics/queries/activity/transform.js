'use strict';
let _ = require('underscore');
let du = global.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let result_array = [];

        du.info(results);

        results.forEach((result) => {

            result_array.push({
                id: result.id,
                datetime: result.datetime,
                actor: result.actor,
                actor_type: result.actor_type,
                action: result.action,
                acted_upon: result.acted_upon,
                acted_upon_type: result.acted_upon_type,
                associated_with: result.associated_with,
                associated_with_type: result.associated_with_type
            });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {activity:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}
