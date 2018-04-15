

module.exports = (forwardMessageController, event, callback) => {

	require('../../../SixCRM.js');
	const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');

	return forwardMessageController.execute().then(() => {

		new LambdaResponse().issueResponse(200, {}, callback);
		return true;

	}).catch((error) =>{

		new LambdaResponse().issueError(error.message, event, callback);

	});
};
