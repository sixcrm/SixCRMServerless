

module.exports.customeremail = (event, context, callback) => {

	require('../../../../SixCRM.js');

	const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
	const EventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');
	const eventEmailsController = new EventEmailsController();

	return eventEmailsController.execute(event).then((result) => {

		return new LambdaResponse().issueResponse(200, {
			message: result
		}, callback);

	}).catch((error) =>{

		return new LambdaResponse().issueError(error.message, event, callback);

	});

}
