

module.exports.confirmorder = (event, context, callback) => {

	require('../../../SixCRM.js');

	let LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
	let ConfirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');
	const confirmOrderController = new ConfirmOrderController();

	confirmOrderController.execute(event).then((response) => {

		return new LambdaResponse().issueSuccess(response, callback);

	}).catch((error) =>{

		return new LambdaResponse().issueError(error, event, callback);

	});

};
