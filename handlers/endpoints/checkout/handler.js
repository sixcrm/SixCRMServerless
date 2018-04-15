

module.exports.checkout = (event, context, callback) => {

	require('../../../SixCRM.js');

	let LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
	let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
	const checkoutController = new CheckoutController();

	checkoutController.execute(event).then((response) => {

		return new LambdaResponse().issueSuccess(response, callback);

	}).catch((error) =>{

		return new LambdaResponse().issueError(error, event, callback);

	});

};
