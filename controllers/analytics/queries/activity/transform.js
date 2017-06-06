'use strict';
let _ = require('underscore');
let du = global.routes.include('lib', 'debug-utilities.js');
let timestamp = global.routes.include('lib', 'timestamp');

let paginationutilities = global.routes.include('lib', 'pagination-utilities.js');
const activityToEnglishController = global.routes.include('controllers','analytics/ActivityToEnglishUtilities');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let result_array = [];

        du.info(results);

        results.forEach((result) => {

            let result_array_entry = {
                id: result.id,
                datetime: timestamp.castToISO8601(result.datetime),
                actor: result.actor,
                actor_type: result.actor_type,
                action: result.action,
                acted_upon: result.acted_upon,
                acted_upon_type: result.acted_upon_type,
                associated_with: result.associated_with,
                associated_with_type: result.associated_with_type,
            };

            let a2e = new activityToEnglishController(result_array_entry);

            let english_object_string = null;

            try{

                english_object_string = a2e.buildActivityEnglishObject();
                du.warning(english_object_string);
                result_array_entry.english = english_object_string;

            }catch(e){

              //du.warning(e);

            }

            result_array.push(result_array_entry);

        });

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {activity:result_array, pagination: pagination_object};

        return resolve(return_object);

    });

}
