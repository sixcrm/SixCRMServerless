'use strict';

require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const PushTransactionRecords = global.SixCRM.routes.include('controllers', 'workers/analytics/PushTransactionRecords.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context');

module.exports.pushrdsrecords = (event, context, callback) => {

	const pushTransactionRecords = new PushTransactionRecords();

	Promise.resolve()
		.then(() => auroraContext.init())
		.then(() => pushTransactionRecords.execute())
		.then(() => auroraContext.dispose())
		.then(() => {

			return new LambdaResponse().issueSuccess({}, callback, 'success');

		})
		.catch((ex) => {

			return new LambdaResponse().issueError(ex.message, event, callback);

		})

};