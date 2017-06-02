'use strict';
let _ = require('underscore');
let du = global.routes.include('lib', 'debug-utilities.js');
let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');
const activityToEnglishController = global.routes.include('controllers','analytics/ActivityToEnglishUtilities');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let result_array = [];

        du.info(results);

        results.forEach((result) => {

            let a2e = new activityToEnglishController(result);

            let english_object_string = a2e.buildActivityStatement();

            result_array.push({
                id: result.id,
                datetime: result.datetime,
                actor: result.actor,
                actor_type: result.actor_type,
                action: result.action,
                acted_upon: result.acted_upon,
                acted_upon_type: result.acted_upon_type,
                associated_with: result.associated_with,
                associated_with_type: result.associated_with_type,
                english: english_object_string
            });

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {activity:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}
