'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

const trackerController = global.routes.include('controllers', 'entities/Tracker.js');

class trackerViewController{

    constructor(){

    }

    view(argumentation_object){

        du.debug('View');

        trackerController.disableACLs();
        return trackerController.get(argumentation_object.pathParameters.argument).then((tracker) => {
            trackerController.enableACLs();

            if(trackerController.validate(tracker)){

                if(tracker.type == 'html'){

                    return Promise.resolve(tracker.body);

                }

            }

            return Promise.reject(new Error('404'));

        });

    }

}

module.exports = new trackerViewController();
