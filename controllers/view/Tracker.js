'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

const trackerController = global.routes.include('controllers', 'entities/Tracker.js');
const LambdaResponse = global.routes.include('lib', 'lambda-response.js');

class trackerViewController{

    constructor(){

    }

    view(argumentation_object){

        du.debug('View');

        du.highlight(argumentation_object);

        if(!_.has(argumentation_object, 'pathParameters')){ return Promise.reject(eu.getError('bad_request','Argumentation object missing pathParameters.')); }

        if(!_.has(argumentation_object.pathParameters, 'tracker')){ return Promise.reject(eu.getError('bad_request','Invalid Argumentation')); }

        let tracker = argumentation_object.pathParameters.tracker;

        trackerController.disableACLs();
        return trackerController.get(tracker).then((tracker) => {
            trackerController.enableACLs();

            if(trackerController.validate(tracker)){

                if(tracker.type == 'html'){

                    let lr = new LambdaResponse;

                    lr.setGlobalHeaders({"Content-Type":"text/html;charset=UTF-8"});

                    return Promise.resolve(tracker.body);

                }

            }

            return Promise.reject(eu.throwError('not_found','Tracker not found.'));

        });

    }

}

module.exports = new trackerViewController();
