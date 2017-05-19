'use strict';
require('../../../routes.js');

const LambdaResponse = global.routes.include('lib', 'lambda-response.js');
const randomRedshiftDataGenerator = global.routes.include('controllers', 'workers/randomRedshiftDataGenerator.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.randomredshiftdata = (event, context, callback) => {

    randomRedshiftDataGenerator.execute().then((result) => {

        new LambdaResponse().issueResponse(200, {
            message: result
        }, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}
