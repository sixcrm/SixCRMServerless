
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp');

let paginationutilities = global.SixCRM.routes.include('lib', 'pagination-utilities.js');
const activityToEnglishController = global.SixCRM.routes.include('controllers','analytics/ActivityToEnglishUtilities');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

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

        result_array.push(a2e.appendActivityEnglishObject());

    });

    return Promise.all(result_array).then((result_array) => {

        parameters['count'] = results.length;

        let pagination_object = paginationutilities.createSQLPaginationObject(parameters);

        let return_object = {activity:result_array, pagination: pagination_object};

        return return_object;

    });

}
