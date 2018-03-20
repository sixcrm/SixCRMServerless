'use strict';

require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const WriteTransactionRecords = global.SixCRM.routes.include('controllers', 'workers/analytics/WriteTransactionRecords.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context');

module.exports.pushrdsrecords = (event, context, callback) => {

	const writeTransactionRecords = new WriteTransactionRecords();

	Promise.resolve()
		.then(() => auroraContext.init())
		.then(() => writeTransactionRecords.execute())
		.then(() => auroraContext.dispose())
		.then(() => {

			return new LambdaResponse().issueSuccess({}, callback, 'success');

		})
		.catch((ex) => {

			return new LambdaResponse().issueError(ex.message, event, callback);

		})

};