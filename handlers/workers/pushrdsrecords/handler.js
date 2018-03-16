'use strict';

require('../../../SixCRM.js');

module.exports.pushrdsrecords = (event, context, callback) => {

	const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
	const PushTransactionRecords = global.SixCRM.routes.include('controllers', 'workers/analytics/PushTransactionRecords.js');

	new PushTransactionRecords().execute().then(() => {

		return new LambdaResponse().issueSuccess({}, callback, 'success');

	    }).catch((ex) => {

		return new LambdaResponse().issueError(ex.message, event, callback);

	});

};
