'use strict';
require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const indexEntitiesController = global.SixCRM.routes.include('controllers', 'workers/indexEntities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.indexentities = (event, context, callback) => {

    du.debug('Executing Index Entities');
    du.debug('Event:', event);

    indexEntitiesController.execute(event).then((result) => {

        du.warning('Result:', result);

        if(result !== indexEntitiesController.messages.success && result !== indexEntitiesController.messages.successnoaction){

            new LambdaResponse().issueResponse(200, {
                message: result
            }, callback);

        }else{

            indexEntitiesController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: result,
                    forward: forward_object
                }, callback);
            });

        }

    }).catch((error) => {

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}
