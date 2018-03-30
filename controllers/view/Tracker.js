'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const TrackerController = global.SixCRM.routes.include('controllers', 'entities/Tracker.js');
const trackerController = new TrackerController();
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');

module.exports = class TrackerViewController{

    constructor(){

    }

    view(argumentation_object){

        du.debug('View');

        du.highlight(argumentation_object);

        if(!_.has(argumentation_object, 'pathParameters')){ return Promise.reject(eu.getError('bad_request','Argumentation object missing pathParameters.')); }

        if(!_.has(argumentation_object.pathParameters, 'tracker')){ return Promise.reject(eu.getError('bad_request','Invalid Argumentation')); }

        let tracker = argumentation_object.pathParameters.tracker;

        trackerController.disableACLs();
        return trackerController.get({id: tracker}).then((tracker) => {
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

