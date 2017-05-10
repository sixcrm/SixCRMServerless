'use strict';
let _ = require('underscore');
let mathutilities = require('../../../../lib/math-utilities.js');
let du = require('../../../../lib/debug-utilities.js');
let timestamp = require('../../../../lib/timestamp.js');

module.exports = function(results, parameters){

    du.debug('Transformation Function');

    return new Promise((resolve, reject) => {

        let return_object = [];

        results.forEach((result) => {

            let result_date_iso8601 = timestamp.convertToISO8601(result[parameters.period].toString());

            let match_identified = false;

            if(return_object.length > 0){

                for(var i = 0; i < return_object.length; i++){

                    if(_.has(return_object[i], 'datetime') && return_object[i].datetime == result_date_iso8601){

                        match_identified = true;

                        return return_object[i].byeventtype.push({
                            event_type: result.event_type.toString(),
                            count: result.event_count.toString()
                        });

                    }

                };

            }

            if(match_identified == false){

                return_object.push({
                    datetime: result_date_iso8601,
                    byeventtype: [{
                        event_type: result.event_type.toString(),
                        count: result.event_count.toString()
                    }]
                });

            }

        });

        du.info("Observation Count: "+return_object.length);

        return resolve({
            events:return_object
        });

    });

}
